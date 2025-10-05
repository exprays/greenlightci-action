import * as core from "@actions/core";
import * as github from "@actions/github";
import {
  BaselineConfig,
  BaselineStatus,
  CompatibilityReport,
  CompatibilityResult,
  getFeatureById,
  calculateCompatibilityScore,
  ACTION_OUTPUTS,
  parseCustomTargets,
  isCompatibleWithTargets,
  ConfigurationError,
  GitHubAPIError,
  ParseError,
  FeatureDetectionError,
  getUserFriendlyError,
  formatErrorForLog,
  getCacheStats,
  pruneAllCaches,
} from "./shared/index.js";
import { getOctokit, getPRDiff, postComment, setStatus } from "./github.js";
import { parsePRDiff, getAddedLines, detectFeatures } from "./parser.js";

/**
 * Send scan results to GreenLightCI dashboard
 */
async function sendToDashboard(
  report: CompatibilityReport,
  context: typeof github.context,
  config: BaselineConfig
): Promise<void> {
  const dashboardUrl = core.getInput("dashboard-url");
  const apiKey = core.getInput("dashboard-api-key");

  if (!dashboardUrl) {
    core.info("ℹ️  Dashboard URL not configured, skipping reporting");
    return;
  }

  if (!apiKey) {
    core.warning("⚠️  Dashboard API key not provided, skipping reporting");
    return;
  }

  try {
    core.info("📊 Sending results to dashboard...");

    const { owner, repo } = context.repo;
    const prNumber = context.payload.pull_request?.number;
    const branch = context.payload.pull_request?.head.ref;
    const commitSha = context.payload.pull_request?.head.sha;

    // Group results by file
    const fileMap = new Map<string, CompatibilityResult[]>();
    for (const result of report.results) {
      if (!fileMap.has(result.filePath)) {
        fileMap.set(result.filePath, []);
      }
      fileMap.get(result.filePath)!.push(result);
    }

    // Prepare submission payload
    const payload = {
      project: {
        name: `${owner}/${repo}`,
        owner,
        repo,
        url: `https://github.com/${owner}/${repo}`,
      },
      scan: {
        prNumber,
        branch,
        commitSha,
        totalFiles: fileMap.size,
        totalFeatures: report.totalFeatures,
        blockingIssues: report.blockingCount,
        warnings: report.warningCount,
        averageScore: report.score,
        targetYear: config.targetYear,
        blockNewly: config.blockNewlyAvailable,
        blockLimited: config.blockLimitedAvailability,
      },
      files: Array.from(fileMap.entries()).map(([filePath, results]) => ({
        filePath,
        score: calculateCompatibilityScore(
          results.filter(
            (r) => r.feature.status === BaselineStatus.WidelyAvailable
          ).length,
          results.filter(
            (r) => r.feature.status === BaselineStatus.NewlyAvailable
          ).length,
          results.filter((r) => r.feature.status === BaselineStatus.Limited)
            .length,
          results.filter((r) => r.feature.status === BaselineStatus.NotBaseline)
            .length
        ),
        issuesCount: results.filter((r) => r.blocking).length,
        features: results.map((r) => ({
          featureId: r.feature.id,
          featureName: r.feature.name,
          status: r.feature.status,
          severity: r.severity,
        })),
      })),
      features: report.results.map((r) => ({
        featureId: r.feature.id,
        featureName: r.feature.name,
        status: r.feature.status,
        severity: r.severity,
        message: `Used in ${r.filePath}${r.line ? ` at line ${r.line}` : ""}`,
        polyfill: null,
      })),
    };

    const response = await fetch(`${dashboardUrl}/api/scans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dashboard API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    core.info(`✅ Results sent to dashboard successfully`);
    core.info(`   Scan ID: ${result.scan?.id || "unknown"}`);
  } catch (error) {
    core.warning(
      `Failed to send results to dashboard: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    // Don't fail the action if dashboard reporting fails
  }
}

/**
 * Main action entry point with comprehensive error handling
 */
export async function run(): Promise<void> {
  try {
    core.info("🚦 GreenLightCI - Baseline Compatibility Checker");
    core.info("================================================");

    // Validate inputs and configuration
    const githubToken = core.getInput("github-token", { required: true });
    if (!githubToken) {
      throw new ConfigurationError(
        "github-token is required but was not provided"
      );
    }

    // Get inputs with validation
    const customTargetsInput = core.getInput("custom-browser-targets");
    let customTargets = null;

    if (customTargetsInput) {
      try {
        customTargets = parseCustomTargets(customTargetsInput);
        core.info(`✓ Custom browser targets parsed successfully`);
      } catch (error) {
        throw new ConfigurationError(
          `Invalid custom-browser-targets format: ${
            error instanceof Error ? error.message : String(error)
          }`,
          { input: customTargetsInput }
        );
      }
    }

    const config: BaselineConfig = {
      targetYear: core.getInput("baseline-year") || "2023",
      blockNewlyAvailable: core.getBooleanInput("block-newly-available"),
      blockLimitedAvailability: core.getBooleanInput(
        "block-limited-availability"
      ),
      ...(customTargets ? { customTargets } : {}),
    };

    core.info(`Starting Baseline compatibility check...`);
    core.info(`Target Year: ${config.targetYear}`);
    core.info(`Block Newly Available: ${config.blockNewlyAvailable}`);
    core.info(`Block Limited Availability: ${config.blockLimitedAvailability}`);
    if (customTargets) {
      core.info(
        `Custom Browser Targets: ${JSON.stringify(customTargets, null, 2)}`
      );
    }

    // Get PR context
    const context = github.context;
    if (!context.payload.pull_request) {
      core.setFailed("This action must be triggered by a pull_request event");
      return;
    }

    const { owner, repo } = context.repo;
    const pullNumber = context.payload.pull_request.number;
    const sha = context.payload.pull_request.head.sha;

    core.info(`Analyzing PR #${pullNumber} in ${owner}/${repo}`);

    // Get Octokit instance
    const octokit = getOctokit(githubToken);

    // Set pending status
    await setStatus(
      octokit,
      owner,
      repo,
      sha,
      "pending",
      "Checking baseline compatibility..."
    );

    // Get PR diff
    const diffContent = await getPRDiff(octokit, owner, repo, pullNumber);
    const files = parsePRDiff(diffContent);

    core.info(`Found ${files.length} changed files`);

    // Analyze each file
    const results: CompatibilityResult[] = [];
    let widelyCount = 0;
    let newlyCount = 0;
    let limitedCount = 0;
    let notBaselineCount = 0;

    for (const file of files) {
      if (!file.to || file.deleted) {
        continue;
      }

      const addedLines = getAddedLines(file);
      if (addedLines.length === 0) {
        continue;
      }

      // Combine all added content
      const content = addedLines.map((l) => l.content).join("\n");

      // Detect features
      const featureIds = detectFeatures(file.to, content);

      for (const featureId of featureIds) {
        const feature = await getFeatureById(featureId);

        if (!feature) {
          continue;
        }

        // Determine severity and blocking
        let severity: "error" | "warning" | "info" = "info";
        let blocking = false;

        // Check custom browser targets if provided
        if (customTargets) {
          const compat = isCompatibleWithTargets(
            feature.support,
            customTargets
          );
          if (!compat.compatible) {
            severity = "error";
            blocking = true;
            core.warning(
              `Feature "${
                feature.name
              }" is not compatible with custom targets: ${compat.incompatibleBrowsers.join(
                ", "
              )}`
            );
          }
        }

        // Apply baseline status rules if not already blocked by custom targets
        if (!blocking) {
          if (feature.status === BaselineStatus.WidelyAvailable) {
            widelyCount++;
          } else if (feature.status === BaselineStatus.NewlyAvailable) {
            newlyCount++;
            severity = "warning";
            blocking = config.blockNewlyAvailable;
          } else if (
            feature.status === BaselineStatus.Limited ||
            feature.status === BaselineStatus.NotBaseline
          ) {
            if (feature.status === BaselineStatus.Limited) {
              limitedCount++;
            } else {
              notBaselineCount++;
            }
            severity = "error";
            blocking = config.blockLimitedAvailability;
          }
        }

        results.push({
          feature,
          filePath: file.to,
          ...(addedLines[0]?.line ? { line: addedLines[0].line } : {}),
          blocking,
          severity,
        });
      }
    }

    // Calculate score
    const score = calculateCompatibilityScore(
      widelyCount,
      newlyCount,
      limitedCount,
      notBaselineCount
    );

    const report: CompatibilityReport = {
      results,
      score,
      blockingCount: results.filter((r) => r.blocking).length,
      warningCount: results.filter((r) => r.severity === "warning").length,
      infoCount: results.filter((r) => r.severity === "info").length,
      totalFeatures: results.length,
    };

    core.info(`Analysis complete: ${report.totalFeatures} features detected`);
    core.info(`Compatibility score: ${score}/100`);
    core.info(`Blocking issues: ${report.blockingCount}`);

    // Send results to dashboard if configured
    await sendToDashboard(report, context, config);

    // Set outputs
    core.setOutput(ACTION_OUTPUTS.COMPATIBILITY_SCORE, score);
    core.setOutput(ACTION_OUTPUTS.FEATURES_DETECTED, report.totalFeatures);
    core.setOutput(ACTION_OUTPUTS.BLOCKING_ISSUES, report.blockingCount);

    // Format and post comment
    const comment = await import("./github.js").then((m) =>
      m.formatComment(report)
    );
    await postComment(octokit, owner, repo, pullNumber, comment);

    // Set final status
    if (report.blockingCount > 0) {
      await setStatus(
        octokit,
        owner,
        repo,
        sha,
        "failure",
        `${report.blockingCount} blocking compatibility issues found`
      );
      core.setFailed(
        `Found ${report.blockingCount} blocking compatibility issues`
      );
    } else {
      await setStatus(
        octokit,
        owner,
        repo,
        sha,
        "success",
        `All features are compatible (Score: ${score}/100)`
      );
      core.info("✅ All checks passed!");
    }

    // Log cache statistics
    const cacheStats = getCacheStats();
    core.info(`📊 Cache Statistics:`);
    core.info(`  Features: ${cacheStats.features.entries} entries`);
    core.info(`  GitHub API: ${cacheStats.github.entries} entries`);
    core.info(`  Diffs: ${cacheStats.diff.entries} entries`);

    // Prune expired cache entries
    pruneAllCaches();
  } catch (error) {
    // Enhanced error handling with detailed logging
    core.error("❌ GreenLightCI encountered an error");

    // Log detailed error information
    const errorLog = formatErrorForLog(error);
    core.error(errorLog);

    // Set user-friendly error message
    const userMessage = getUserFriendlyError(error);

    // Handle specific error types
    if (error instanceof ConfigurationError) {
      core.error(
        "💡 Configuration Error: Please check your workflow configuration"
      );
      core.setFailed(`Configuration error: ${userMessage}`);
    } else if (error instanceof GitHubAPIError) {
      core.error(
        "💡 GitHub API Error: Check your token permissions and rate limits"
      );
      core.setFailed(`GitHub API error: ${userMessage}`);
    } else if (error instanceof ParseError) {
      core.error("💡 Parse Error: Failed to parse PR diff");
      core.setFailed(`Parse error: ${userMessage}`);
    } else if (error instanceof FeatureDetectionError) {
      core.error("💡 Feature Detection Error: Failed to detect features");
      core.setFailed(`Feature detection error: ${userMessage}`);
    } else if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed("An unknown error occurred");
    }

    // Attempt to clean up caches on error
    try {
      pruneAllCaches();
    } catch {
      // Ignore cache cleanup errors
    }
  }
}

// Run the action
run();

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOctokit = getOctokit;
exports.getPRDiff = getPRDiff;
exports.formatComment = formatComment;
exports.postComment = postComment;
exports.setStatus = setStatus;
var core = require("@actions/core");
var rest_1 = require("@octokit/rest");
var shared_1 = require("./shared");
/**
 * Get the Octokit instance for GitHub API
 */
function getOctokit(token) {
    return new rest_1.Octokit({ auth: token });
}
/**
 * Get PR diff content (with caching and error handling)
 */
function getPRDiff(octokit, owner, repo, pullNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var cacheKey, cached, data, diffContent, error_1, statusCode, message;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    cacheKey = (0, shared_1.getPRDiffCacheKey)(owner, repo, pullNumber);
                    cached = shared_1.githubCache.get(cacheKey);
                    if (cached !== undefined) {
                        core.info("Using cached diff for PR #".concat(pullNumber));
                        return [2 /*return*/, cached];
                    }
                    core.info("Fetching diff for PR #".concat(pullNumber, "..."));
                    return [4 /*yield*/, octokit.rest.pulls.get({
                            owner: owner,
                            repo: repo,
                            pull_number: pullNumber,
                            mediaType: {
                                format: 'diff',
                            },
                        })];
                case 1:
                    data = (_b.sent()).data;
                    diffContent = data;
                    // Cache the result (10 minute TTL)
                    shared_1.githubCache.set(cacheKey, diffContent, 600);
                    return [2 /*return*/, diffContent];
                case 2:
                    error_1 = _b.sent();
                    statusCode = (error_1 === null || error_1 === void 0 ? void 0 : error_1.status) || ((_a = error_1 === null || error_1 === void 0 ? void 0 : error_1.response) === null || _a === void 0 ? void 0 : _a.status);
                    message = (error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || 'Unknown error';
                    core.error("Failed to fetch PR diff: ".concat(message));
                    throw new shared_1.GitHubAPIError("Failed to fetch PR #".concat(pullNumber, " diff: ").concat(message), statusCode, { owner: owner, repo: repo, pullNumber: pullNumber });
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Format compatibility report as markdown comment
 */
function formatComment(report) {
    var results = report.results, score = report.score, blockingCount = report.blockingCount, warningCount = report.warningCount, totalFeatures = report.totalFeatures;
    var comment = "".concat(shared_1.GITHUB_MARKERS.COMMENT_HEADER, "\n\n");
    comment += "# ".concat(shared_1.GITHUB_MARKERS.COMMENT_TITLE, "\n\n");
    // Overall score with progress bar
    var scoreEmoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
    var progressBar = generateProgressBar(score);
    comment += "## Compatibility Score: ".concat(scoreEmoji, " **").concat(score, "/100**\n\n");
    comment += "".concat(progressBar, "\n\n");
    // Summary table
    comment += "| Metric | Count | Status |\n";
    comment += "|--------|-------|--------|\n";
    comment += "| Features Detected | ".concat(totalFeatures, " | \u2139\uFE0F |\n");
    comment += "| Blocking Issues | ".concat(blockingCount, " | ").concat(blockingCount > 0 ? '❌' : '✅', " |\n");
    comment += "| Warnings | ".concat(warningCount, " | ").concat(warningCount > 0 ? '⚠️' : '✅', " |\n");
    comment += "| Safe to Use | ".concat(report.infoCount, " | \u2705 |\n\n");
    if (results.length === 0) {
        comment += "> \u2705 **Great news!** No web features detected in this PR that require compatibility checking.\n\n";
        comment += "This PR doesn't introduce any new web platform features that need baseline validation.\n";
        return (comment +
            "\n---\n\uD83E\uDD16 *Powered by [GreenLightCI](https://github.com/your-org/greenlightci)*\n");
    }
    // Group results by severity
    var blocking = results.filter(function (r) { return r.blocking; });
    var warnings = results.filter(function (r) { return r.severity === 'warning' && !r.blocking; });
    var info = results.filter(function (r) { return r.severity === 'info'; });
    // Blocking issues with action items
    if (blocking.length > 0) {
        comment += "## \u274C Blocking Issues\n\n";
        comment += "> **Action Required:** The following features need attention before merging.\n\n";
        for (var _i = 0, blocking_1 = blocking; _i < blocking_1.length; _i++) {
            var result = blocking_1[_i];
            comment += formatFeatureResult(result);
        }
    }
    // Warnings with recommendations
    if (warnings.length > 0) {
        comment += "## \u26A0\uFE0F Warnings\n\n";
        comment += "> **Recommendation:** These features are newly available. Consider adding polyfills for broader support.\n\n";
        for (var _a = 0, warnings_1 = warnings; _a < warnings_1.length; _a++) {
            var result = warnings_1[_a];
            comment += formatFeatureResult(result);
        }
    }
    // Info - collapsible for cleaner view
    if (info.length > 0) {
        comment += "## \u2705 Safe to Use\n\n";
        comment += "<details>\n<summary><b>View ".concat(info.length, " widely available feature").concat(info.length > 1 ? 's' : '', "</b> (click to expand)</summary>\n\n");
        for (var _b = 0, info_1 = info; _b < info_1.length; _b++) {
            var result = info_1[_b];
            comment += formatFeatureResult(result);
        }
        comment += "</details>\n\n";
    }
    comment += "---\n";
    comment += "\n### \uD83D\uDCDA Resources\n\n";
    comment += "- [Baseline Documentation](https://web.dev/baseline/)\n";
    comment += "- [Browser Compatibility Data](https://github.com/mdn/browser-compat-data)\n";
    comment += "- [Can I Use](https://caniuse.com/)\n\n";
    comment += "<sub>\uD83E\uDD16 Generated by [GreenLightCI](https://github.com/your-org/greenlightci) | Need help? [Open an issue](https://github.com/your-org/greenlightci/issues)</sub>\n";
    return comment;
}
/**
 * Generate a visual progress bar for the score
 */
function generateProgressBar(score) {
    var filled = Math.floor(score / 5); // 20 blocks for 100%
    var empty = 20 - filled;
    var bar = '█'.repeat(filled) + '░'.repeat(empty);
    return "`".concat(bar, "` ").concat(score, "%");
}
/**
 * Format individual feature result
 */
function formatFeatureResult(result) {
    var feature = result.feature, filePath = result.filePath, line = result.line;
    var statusEmoji = getStatusEmoji(feature.status);
    var output = "#### ".concat(statusEmoji, " `").concat(feature.name, "`\n\n");
    // Status badge with color
    var statusBadge = getStatusBadge(feature.status, feature.baselineYear);
    output += "".concat(statusBadge, "\n\n");
    output += "- **Location:** `".concat(filePath, "`");
    if (line) {
        output += ":".concat(line);
    }
    output += "\n";
    // Browser support
    if (Object.keys(feature.support).length > 0) {
        output += "- **Browser Support:** ";
        var supportList = [];
        if (feature.support.chrome)
            supportList.push("Chrome ".concat(feature.support.chrome, "+"));
        if (feature.support.edge)
            supportList.push("Edge ".concat(feature.support.edge, "+"));
        if (feature.support.firefox)
            supportList.push("Firefox ".concat(feature.support.firefox, "+"));
        if (feature.support.safari)
            supportList.push("Safari ".concat(feature.support.safari, "+"));
        output += supportList.join(' • ') + "\n";
    }
    // Polyfill suggestions for non-widely-available features
    if (feature.status !== shared_1.BaselineStatus.WidelyAvailable &&
        result.severity !== 'info') {
        var polyfill = (0, shared_1.getPolyfillSuggestion)(feature.id);
        if (polyfill) {
            output += "\n<details>\n<summary>\uD83D\uDCA1 <b>Polyfill & Fallback Options</b></summary>\n\n";
            output += (0, shared_1.formatPolyfillSuggestion)(polyfill);
            output += "</details>\n";
        }
    }
    // Links
    if (feature.mdnUrl) {
        output += "\n\uD83D\uDCD6 [View on MDN](".concat(feature.mdnUrl, ")");
    }
    if (feature.specUrl) {
        output += " \u2022 [Specification](".concat(feature.specUrl, ")");
    }
    output += "\n\n";
    return output;
}
/**
 * Get status badge with color
 */
function getStatusBadge(status, year) {
    switch (status) {
        case shared_1.BaselineStatus.WidelyAvailable:
            return "![Widely Available](https://img.shields.io/badge/Baseline-Widely%20Available".concat(year ? "%20(".concat(year, ")") : '', "-brightgreen)");
        case shared_1.BaselineStatus.NewlyAvailable:
            return "![Newly Available](https://img.shields.io/badge/Baseline-Newly%20Available".concat(year ? "%20(".concat(year, ")") : '', "-yellow)");
        case shared_1.BaselineStatus.Limited:
            return "![Limited](https://img.shields.io/badge/Baseline-Limited%20Availability-orange)";
        case shared_1.BaselineStatus.NotBaseline:
            return "![Not Baseline](https://img.shields.io/badge/Status-Not%20Baseline-red)";
        default:
            return "![Unknown](https://img.shields.io/badge/Status-Unknown-lightgrey)";
    }
}
/**
 * Get emoji for baseline status
 */
function getStatusEmoji(status) {
    switch (status) {
        case shared_1.BaselineStatus.WidelyAvailable:
            return shared_1.STATUS_EMOJIS.WIDELY_AVAILABLE;
        case shared_1.BaselineStatus.NewlyAvailable:
            return shared_1.STATUS_EMOJIS.NEWLY_AVAILABLE;
        case shared_1.BaselineStatus.Limited:
            return shared_1.STATUS_EMOJIS.LIMITED;
        case shared_1.BaselineStatus.NotBaseline:
            return shared_1.STATUS_EMOJIS.NOT_BASELINE;
        default:
            return shared_1.STATUS_EMOJIS.UNKNOWN;
    }
}
/**
 * Post or update comment on PR (with enhanced error handling)
 */
function postComment(octokit, owner, repo, pullNumber, body) {
    return __awaiter(this, void 0, void 0, function () {
        var comments, existingComment, newComment, error_2, statusCode, message;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    core.info('Posting compatibility report to PR...');
                    return [4 /*yield*/, octokit.rest.issues.listComments({
                            owner: owner,
                            repo: repo,
                            issue_number: pullNumber,
                        })];
                case 1:
                    comments = (_b.sent()).data;
                    existingComment = comments.find(function (comment) { var _a; return (_a = comment.body) === null || _a === void 0 ? void 0 : _a.includes(shared_1.GITHUB_MARKERS.COMMENT_HEADER); });
                    if (!existingComment) return [3 /*break*/, 3];
                    // Update existing comment
                    return [4 /*yield*/, octokit.rest.issues.updateComment({
                            owner: owner,
                            repo: repo,
                            comment_id: existingComment.id,
                            body: body,
                        })];
                case 2:
                    // Update existing comment
                    _b.sent();
                    core.info("\u2713 Updated existing compatibility comment (ID: ".concat(existingComment.id, ")"));
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, octokit.rest.issues.createComment({
                        owner: owner,
                        repo: repo,
                        issue_number: pullNumber,
                        body: body,
                    })];
                case 4:
                    newComment = (_b.sent()).data;
                    core.info("\u2713 Created new compatibility comment (ID: ".concat(newComment.id, ")"));
                    _b.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_2 = _b.sent();
                    statusCode = (error_2 === null || error_2 === void 0 ? void 0 : error_2.status) || ((_a = error_2 === null || error_2 === void 0 ? void 0 : error_2.response) === null || _a === void 0 ? void 0 : _a.status);
                    message = (error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || 'Unknown error';
                    core.error("Failed to post comment: ".concat(message));
                    throw new shared_1.GitHubAPIError("Failed to post comment on PR #".concat(pullNumber, ": ").concat(message), statusCode, { owner: owner, repo: repo, pullNumber: pullNumber, commentLength: body.length });
                case 7: return [2 /*return*/];
            }
        });
    });
}
/**
 * Set PR status check (with enhanced error handling)
 */
function setStatus(octokit, owner, repo, sha, state, description) {
    return __awaiter(this, void 0, void 0, function () {
        var error_3, statusCode, message;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, octokit.rest.repos.createCommitStatus({
                            owner: owner,
                            repo: repo,
                            sha: sha,
                            state: state,
                            context: 'Baseline Compatibility',
                            description: description,
                            target_url: "https://github.com/".concat(owner, "/").concat(repo, "/actions"),
                        })];
                case 1:
                    _b.sent();
                    core.info("\u2713 Set status to \"".concat(state, "\": ").concat(description));
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _b.sent();
                    statusCode = (error_3 === null || error_3 === void 0 ? void 0 : error_3.status) || ((_a = error_3 === null || error_3 === void 0 ? void 0 : error_3.response) === null || _a === void 0 ? void 0 : _a.status);
                    message = (error_3 === null || error_3 === void 0 ? void 0 : error_3.message) || 'Unknown error';
                    // Don't fail the action if we can't set status, just warn
                    core.warning("Failed to set commit status: ".concat(message, " (status code: ").concat(statusCode, ")"));
                    core.warning('This may happen if the GitHub token lacks status check permissions');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}

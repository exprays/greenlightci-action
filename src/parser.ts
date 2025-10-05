import * as parseDiff from "parse-diff";
import { File } from "parse-diff";
import { ParseError } from "./shared/index.js";

/**
 * Parse diff content and extract file changes (with error handling)
 */
export function parsePRDiff(diffContent: string): File[] {
  try {
    if (!diffContent || diffContent.trim().length === 0) {
      throw new ParseError("Diff content is empty", { contentLength: 0 });
    }

    const files = parseDiff(diffContent);

    if (!files || files.length === 0) {
      return [];
    }

    return files;
  } catch (error) {
    if (error instanceof ParseError) {
      throw error;
    }

    throw new ParseError(
      `Failed to parse PR diff: ${
        error instanceof Error ? error.message : String(error)
      }`,
      { contentLength: diffContent?.length || 0 }
    );
  }
}

/**
 * Extract added lines from a diff file
 */
export function getAddedLines(
  file: File
): Array<{ line: number; content: string }> {
  const addedLines: Array<{ line: number; content: string }> = [];

  if (!file.chunks) {
    return addedLines;
  }

  for (const chunk of file.chunks) {
    let lineNumber = chunk.newStart || 0;

    for (const change of chunk.changes) {
      if (change.type === "add") {
        addedLines.push({
          line: lineNumber,
          content: change.content || "",
        });
      }

      if (change.type !== "del") {
        lineNumber++;
      }
    }
  }

  return addedLines;
}

/**
 * Detect CSS features in code content (with error handling)
 */
export function detectCSSFeatures(content: string): string[] {
  try {
    const detected: Set<string> = new Set();

    // Check for container queries
    if (/@container|container-type|container-name/gi.test(content)) {
      detected.add("container-queries");
    }

    // Check for :has() selector
    if (/:has\(/gi.test(content)) {
      detected.add("has");
    }

    // Check for CSS Grid
    if (/display:\s*grid|grid-template/gi.test(content)) {
      detected.add("grid");
    }

    // Check for Subgrid
    if (/subgrid/gi.test(content)) {
      detected.add("subgrid");
    }

    // Check for CSS Nesting
    if (/&\s*\{|&\s+\./gi.test(content)) {
      detected.add("nesting"); // web-features uses "nesting" not "css-nesting"
    }

    // Check for Custom Properties
    if (/var\(--/gi.test(content)) {
      detected.add("custom-properties");
    }

    // Check for Logical Properties
    if (/inline-start|inline-end|block-start|block-end/gi.test(content)) {
      detected.add("logical-properties");
    }

    return Array.from(detected);
  } catch (error) {
    // Return empty array on error, don't break the pipeline
    console.warn(`Error detecting CSS features: ${error}`);
    return [];
  }
}

/**
 * Detect JavaScript features in code content (with error handling)
 */
export function detectJSFeatures(content: string): string[] {
  try {
    const detected: Set<string> = new Set();

    // NOTE: Most JavaScript language features (optional chaining, nullish coalescing,
    // private fields, etc.) are ECMAScript spec features, not "web features" tracked
    // by the web-features package. The web-features package focuses on Web Platform
    // APIs and CSS features, not core JavaScript syntax.

    // Top-level await IS tracked by web-features as it's a module-level feature
    if (/^(?!.*function).*await\s+/gm.test(content)) {
      detected.add("top-level-await");
    }

    // Dynamic import() is tracked as "js-modules" in web-features
    // but the pattern here is too broad - import() is part of modules
    // For now, we skip it as it's hard to distinguish from regular module usage
    // if (/import\(/g.test(content)) {
    //   detected.add("js-modules");
    // }

    return Array.from(detected);
  } catch (error) {
    // Return empty array on error, don't break the pipeline
    console.warn(`Error detecting JS features: ${error}`);
    return [];
  }
}

/**
 * Detect web features in file based on extension and content (with error handling)
 */
export function detectFeatures(fileName: string, content: string): string[] {
  try {
    if (!fileName || !content) {
      return [];
    }

    const extension = fileName.split(".").pop()?.toLowerCase();
    const features: string[] = [];

    if (extension === "css" || extension === "scss" || extension === "less") {
      features.push(...detectCSSFeatures(content));
    }

    if (
      extension === "js" ||
      extension === "ts" ||
      extension === "jsx" ||
      extension === "tsx"
    ) {
      features.push(...detectJSFeatures(content));
    }

    // For files with both (like .vue, .svelte), check both
    if (extension === "vue" || extension === "svelte") {
      features.push(...detectCSSFeatures(content));
      features.push(...detectJSFeatures(content));
    }

    return features;
  } catch (error) {
    // Don't throw - return empty array and log warning
    // This ensures one file parsing error doesn't break the entire check
    console.warn(`Failed to detect features in ${fileName}: ${error}`);
    return [];
  }
}

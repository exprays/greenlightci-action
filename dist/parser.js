"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePRDiff = parsePRDiff;
exports.getAddedLines = getAddedLines;
exports.detectCSSFeatures = detectCSSFeatures;
exports.detectJSFeatures = detectJSFeatures;
exports.detectFeatures = detectFeatures;
var parseDiff = require("parse-diff");
var shared_1 = require("./shared");
/**
 * Parse diff content and extract file changes (with error handling)
 */
function parsePRDiff(diffContent) {
    try {
        if (!diffContent || diffContent.trim().length === 0) {
            throw new shared_1.ParseError("Diff content is empty", { contentLength: 0 });
        }
        var files = parseDiff(diffContent);
        if (!files || files.length === 0) {
            return [];
        }
        return files;
    }
    catch (error) {
        if (error instanceof shared_1.ParseError) {
            throw error;
        }
        throw new shared_1.ParseError("Failed to parse PR diff: ".concat(error instanceof Error ? error.message : String(error)), { contentLength: (diffContent === null || diffContent === void 0 ? void 0 : diffContent.length) || 0 });
    }
}
/**
 * Extract added lines from a diff file
 */
function getAddedLines(file) {
    var addedLines = [];
    if (!file.chunks) {
        return addedLines;
    }
    for (var _i = 0, _a = file.chunks; _i < _a.length; _i++) {
        var chunk = _a[_i];
        var lineNumber = chunk.newStart || 0;
        for (var _b = 0, _c = chunk.changes; _b < _c.length; _b++) {
            var change = _c[_b];
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
function detectCSSFeatures(content) {
    try {
        var detected = new Set();
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
            detected.add("css-nesting");
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
    }
    catch (error) {
        // Return empty array on error, don't break the pipeline
        console.warn("Error detecting CSS features: ".concat(error));
        return [];
    }
}
/**
 * Detect JavaScript features in code content (with error handling)
 */
function detectJSFeatures(content) {
    try {
        var detected = new Set();
        // Check for optional chaining
        if (/\?\./g.test(content)) {
            detected.add("optional-chaining");
        }
        // Check for nullish coalescing
        if (/\?\?/g.test(content)) {
            detected.add("nullish-coalescing");
        }
        // Check for dynamic import
        if (/import\(/g.test(content)) {
            detected.add("dynamic-import");
        }
        // Check for top-level await
        if (/^(?!.*function).*await\s+/gm.test(content)) {
            detected.add("top-level-await");
        }
        // Check for private fields
        if (/#[a-zA-Z_]/g.test(content)) {
            detected.add("private-fields");
        }
        return Array.from(detected);
    }
    catch (error) {
        // Return empty array on error, don't break the pipeline
        console.warn("Error detecting JS features: ".concat(error));
        return [];
    }
}
/**
 * Detect web features in file based on extension and content (with error handling)
 */
function detectFeatures(fileName, content) {
    var _a;
    try {
        if (!fileName || !content) {
            return [];
        }
        var extension = (_a = fileName.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        var features = [];
        if (extension === "css" || extension === "scss" || extension === "less") {
            features.push.apply(features, detectCSSFeatures(content));
        }
        if (extension === "js" ||
            extension === "ts" ||
            extension === "jsx" ||
            extension === "tsx") {
            features.push.apply(features, detectJSFeatures(content));
        }
        // For files with both (like .vue, .svelte), check both
        if (extension === "vue" || extension === "svelte") {
            features.push.apply(features, detectCSSFeatures(content));
            features.push.apply(features, detectJSFeatures(content));
        }
        return features;
    }
    catch (error) {
        // Don't throw - return empty array and log warning
        // This ensures one file parsing error doesn't break the entire check
        console.warn("Failed to detect features in ".concat(fileName, ": ").concat(error));
        return [];
    }
}

"use strict";
/**
 * Constants used across GreenLightCI packages
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.STATUS_EMOJIS = exports.GITHUB_MARKERS = exports.ACTION_OUTPUTS = exports.JS_FEATURE_PATTERNS = exports.CSS_FEATURE_PATTERNS = exports.BASELINE_YEARS = void 0;
/** Baseline years for classification */
exports.BASELINE_YEARS = {
    WIDELY_AVAILABLE_THRESHOLD: 30, // months after baseline for "widely available"
};
/** Feature patterns to detect in code */
exports.CSS_FEATURE_PATTERNS = {
    CONTAINER_QUERIES: /@container|container-type|container-name/gi,
    HAS_SELECTOR: /:has\(/gi,
    CSS_GRID: /display:\s*grid|grid-template/gi,
    SUBGRID: /subgrid/gi,
    CSS_NESTING: /&\s*\{/gi,
    CUSTOM_PROPERTIES: /var\(--/gi,
    LOGICAL_PROPERTIES: /inline-start|inline-end|block-start|block-end/gi,
};
exports.JS_FEATURE_PATTERNS = {
    OPTIONAL_CHAINING: /\?\./g,
    NULLISH_COALESCING: /\?\?/g,
    DYNAMIC_IMPORT: /import\(/g,
    TOP_LEVEL_AWAIT: /^(?!.*function).*await\s+/gm,
    PRIVATE_FIELDS: /#[a-zA-Z_]/g,
};
/** GitHub Action outputs */
exports.ACTION_OUTPUTS = {
    COMPATIBILITY_SCORE: 'compatibility-score',
    FEATURES_DETECTED: 'features-detected',
    BLOCKING_ISSUES: 'blocking-issues',
};
/** Comment markers for GitHub */
exports.GITHUB_MARKERS = {
    COMMENT_HEADER: '<!-- greenlightci-baseline-check -->',
    COMMENT_TITLE: '🚦 Baseline Compatibility Report',
};
/** Status emojis for visual feedback */
exports.STATUS_EMOJIS = {
    WIDELY_AVAILABLE: '✅',
    NEWLY_AVAILABLE: '⚠️',
    LIMITED: '❌',
    NOT_BASELINE: '🚫',
    UNKNOWN: '❓',
};

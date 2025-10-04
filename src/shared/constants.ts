/**
 * Constants used across GreenLightCI packages
 */

/** Baseline years for classification */
export const BASELINE_YEARS = {
  WIDELY_AVAILABLE_THRESHOLD: 30, // months after baseline for "widely available"
} as const;

/** Feature patterns to detect in code */
export const CSS_FEATURE_PATTERNS = {
  CONTAINER_QUERIES: /@container|container-type|container-name/gi,
  HAS_SELECTOR: /:has\(/gi,
  CSS_GRID: /display:\s*grid|grid-template/gi,
  SUBGRID: /subgrid/gi,
  CSS_NESTING: /&\s*\{/gi,
  CUSTOM_PROPERTIES: /var\(--/gi,
  LOGICAL_PROPERTIES: /inline-start|inline-end|block-start|block-end/gi,
} as const;

export const JS_FEATURE_PATTERNS = {
  OPTIONAL_CHAINING: /\?\./g,
  NULLISH_COALESCING: /\?\?/g,
  DYNAMIC_IMPORT: /import\(/g,
  TOP_LEVEL_AWAIT: /^(?!.*function).*await\s+/gm,
  PRIVATE_FIELDS: /#[a-zA-Z_]/g,
} as const;

/** GitHub Action outputs */
export const ACTION_OUTPUTS = {
  COMPATIBILITY_SCORE: 'compatibility-score',
  FEATURES_DETECTED: 'features-detected',
  BLOCKING_ISSUES: 'blocking-issues',
} as const;

/** Comment markers for GitHub */
export const GITHUB_MARKERS = {
  COMMENT_HEADER: '<!-- greenlightci-baseline-check -->',
  COMMENT_TITLE: '🚦 Baseline Compatibility Report',
} as const;

/** Status emojis for visual feedback */
export const STATUS_EMOJIS = {
  WIDELY_AVAILABLE: '✅',
  NEWLY_AVAILABLE: '⚠️',
  LIMITED: '❌',
  NOT_BASELINE: '🚫',
  UNKNOWN: '❓',
} as const;

"use strict";
/**
 * Polyfill and fallback suggestions for web features
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.POLYFILL_SUGGESTIONS = void 0;
exports.getPolyfillSuggestion = getPolyfillSuggestion;
exports.formatPolyfillSuggestion = formatPolyfillSuggestion;
exports.POLYFILL_SUGGESTIONS = {
    'container-queries': {
        feature: 'Container Queries',
        polyfills: ['@oddbird/css-anchor-positioning'],
        fallbackStrategy: 'Use media queries as fallback or feature detection with ResizeObserver',
        npmPackages: ['container-query-polyfill'],
        cdnLinks: [
            'https://unpkg.com/container-query-polyfill@1.0.2/dist/container-query-polyfill.modern.js',
        ],
    },
    has: {
        feature: ':has() selector',
        polyfills: [],
        fallbackStrategy: 'Use JavaScript for dynamic class toggling based on child presence',
        npmPackages: [],
        cdnLinks: [],
    },
    grid: {
        feature: 'CSS Grid',
        polyfills: [],
        fallbackStrategy: 'Use Flexbox or floats for older browsers. Grid is widely supported.',
        npmPackages: [],
        cdnLinks: [],
    },
    subgrid: {
        feature: 'CSS Subgrid',
        polyfills: [],
        fallbackStrategy: 'Use nested grids or define columns explicitly on child elements',
        npmPackages: [],
        cdnLinks: [],
    },
    'css-nesting': {
        feature: 'CSS Nesting',
        polyfills: ['postcss-nesting'],
        fallbackStrategy: 'Use a PostCSS plugin to compile nested CSS to flat CSS',
        npmPackages: ['postcss-nesting', 'postcss-preset-env'],
        cdnLinks: [],
    },
    'custom-properties': {
        feature: 'CSS Custom Properties',
        polyfills: ['css-vars-ponyfill'],
        fallbackStrategy: 'Provide static fallback values before custom property usage',
        npmPackages: ['css-vars-ponyfill'],
        cdnLinks: [
            'https://unpkg.com/css-vars-ponyfill@2.4.8/dist/css-vars-ponyfill.min.js',
        ],
    },
    'logical-properties': {
        feature: 'CSS Logical Properties',
        polyfills: ['postcss-logical'],
        fallbackStrategy: 'Use PostCSS to convert logical properties to physical ones',
        npmPackages: ['postcss-logical'],
        cdnLinks: [],
    },
    'optional-chaining': {
        feature: 'Optional Chaining',
        polyfills: ['@babel/plugin-proposal-optional-chaining'],
        fallbackStrategy: 'Use Babel to transpile or manual null checks',
        npmPackages: ['@babel/plugin-proposal-optional-chaining'],
        cdnLinks: [],
    },
    'nullish-coalescing': {
        feature: 'Nullish Coalescing',
        polyfills: ['@babel/plugin-proposal-nullish-coalescing-operator'],
        fallbackStrategy: 'Use Babel to transpile or ternary operators with null/undefined checks',
        npmPackages: ['@babel/plugin-proposal-nullish-coalescing-operator'],
        cdnLinks: [],
    },
    'dynamic-import': {
        feature: 'Dynamic Import',
        polyfills: ['@babel/plugin-syntax-dynamic-import'],
        fallbackStrategy: 'Use webpack code splitting or require.ensure() for older bundlers',
        npmPackages: ['@babel/plugin-syntax-dynamic-import'],
        cdnLinks: [],
    },
    'top-level-await': {
        feature: 'Top-level Await',
        polyfills: ['@babel/plugin-syntax-top-level-await'],
        fallbackStrategy: 'Wrap in async IIFE: (async () => { await ... })()',
        npmPackages: ['@babel/plugin-syntax-top-level-await'],
        cdnLinks: [],
    },
    'private-fields': {
        feature: 'Private Fields',
        polyfills: ['@babel/plugin-proposal-class-properties'],
        fallbackStrategy: 'Use WeakMap for private data or conventional naming (e.g., _privateField)',
        npmPackages: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-private-methods',
        ],
        cdnLinks: [],
    },
};
/**
 * Get polyfill suggestion for a feature
 */
function getPolyfillSuggestion(featureId) {
    return exports.POLYFILL_SUGGESTIONS[featureId];
}
/**
 * Format polyfill suggestion as markdown
 */
function formatPolyfillSuggestion(suggestion) {
    var text = '';
    if (suggestion.fallbackStrategy) {
        text += "**\uD83D\uDCA1 Fallback Strategy:**\n".concat(suggestion.fallbackStrategy, "\n\n");
    }
    if (suggestion.npmPackages && suggestion.npmPackages.length > 0) {
        text += "**\uD83D\uDCE6 NPM Packages:**\n";
        suggestion.npmPackages.forEach(function (pkg) {
            text += "```bash\nnpm install ".concat(pkg, "\n```\n");
        });
    }
    if (suggestion.cdnLinks && suggestion.cdnLinks.length > 0) {
        text += "**\uD83D\uDD17 CDN Links:**\n";
        suggestion.cdnLinks.forEach(function (link) {
            text += "- ".concat(link, "\n");
        });
    }
    return text;
}

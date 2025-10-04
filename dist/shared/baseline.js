"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaselineStatus = getBaselineStatus;
exports.getBaselineYear = getBaselineYear;
exports.getBrowserSupport = getBrowserSupport;
exports.getAllBaselineFeatures = getAllBaselineFeatures;
exports.getFeatureById = getFeatureById;
exports.calculateCompatibilityScore = calculateCompatibilityScore;
var web_features_1 = require("web-features");
var types_js_1 = require("./types.js");
var cache_js_1 = require("./cache.js");
var errors_js_1 = require("./errors.js");
/**
 * Get baseline status from web-features data
 */
function getBaselineStatus(featureData) {
    var _a;
    if (!featureData) {
        return types_js_1.BaselineStatus.Unknown;
    }
    var baseline = (_a = featureData.status) === null || _a === void 0 ? void 0 : _a.baseline;
    if (baseline === "high" || baseline === "widely") {
        return types_js_1.BaselineStatus.WidelyAvailable;
    }
    if (baseline === "low" || baseline === "newly") {
        return types_js_1.BaselineStatus.NewlyAvailable;
    }
    if (baseline === false) {
        return types_js_1.BaselineStatus.NotBaseline;
    }
    return types_js_1.BaselineStatus.Limited;
}
/**
 * Get baseline year from feature data
 */
function getBaselineYear(featureData) {
    var _a, _b;
    var baselineDate = ((_a = featureData.status) === null || _a === void 0 ? void 0 : _a.baseline_high_date) ||
        ((_b = featureData.status) === null || _b === void 0 ? void 0 : _b.baseline_low_date);
    if (baselineDate) {
        return new Date(baselineDate).getFullYear().toString();
    }
    return undefined;
}
/**
 * Extract browser support information
 */
function getBrowserSupport(featureData) {
    var _a;
    var support = {};
    if ((_a = featureData.status) === null || _a === void 0 ? void 0 : _a.support) {
        var supportData = featureData.status.support;
        if (supportData.chrome)
            support.chrome = supportData.chrome;
        if (supportData.edge)
            support.edge = supportData.edge;
        if (supportData.firefox)
            support.firefox = supportData.firefox;
        if (supportData.safari)
            support.safari = supportData.safari;
    }
    return support;
}
/**
 * Get all baseline features from web-features package
 */
function getAllBaselineFeatures() {
    var featureMap = new Map();
    // web-features is an object with feature IDs as keys
    for (var _i = 0, _a = Object.entries(web_features_1.default); _i < _a.length; _i++) {
        var _b = _a[_i], featureId = _b[0], featureData = _b[1];
        var status_1 = getBaselineStatus(featureData);
        var baselineYear = getBaselineYear(featureData);
        var support = getBrowserSupport(featureData);
        var baselineFeature = __assign(__assign({ id: featureId, name: featureData.name || featureId, description: featureData.description, status: status_1 }, (baselineYear ? { baselineYear: baselineYear } : {})), { support: support, mdnUrl: featureData.mdn_url, specUrl: featureData.spec });
        featureMap.set(featureId, baselineFeature);
    }
    return featureMap;
}
/**
 * Find feature by ID (with caching)
 */
function getFeatureById(featureId) {
    try {
        // Check cache first
        var cacheKey = (0, cache_js_1.getFeatureCacheKey)(featureId);
        var cached = cache_js_1.featureCache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }
        // Fetch from web-features
        var featureData = web_features_1.default[featureId];
        if (!featureData) {
            return undefined;
        }
        var status_2 = getBaselineStatus(featureData);
        var baselineYear = getBaselineYear(featureData);
        var support = getBrowserSupport(featureData);
        var feature = __assign(__assign({ id: featureId, name: featureData.name || featureId, description: featureData.description, status: status_2 }, (baselineYear ? { baselineYear: baselineYear } : {})), { support: support, mdnUrl: featureData.mdn_url, specUrl: featureData.spec });
        // Cache the result (24 hour TTL)
        cache_js_1.featureCache.set(cacheKey, feature, 86400);
        return feature;
    }
    catch (error) {
        throw (0, errors_js_1.wrapError)(error, "Failed to get feature by ID: ".concat(featureId), "FEATURE_LOOKUP_ERROR", { featureId: featureId });
    }
}
/**
 * Calculate compatibility score (0-100)
 */
function calculateCompatibilityScore(widelyAvailable, newlyAvailable, limited, notBaseline) {
    var total = widelyAvailable + newlyAvailable + limited + notBaseline;
    if (total === 0) {
        return 100;
    }
    // Weighted scoring:
    // Widely Available: 100% weight
    // Newly Available: 75% weight
    // Limited: 25% weight
    // Not Baseline: 0% weight
    var score = (widelyAvailable * 100 +
        newlyAvailable * 75 +
        limited * 25 +
        notBaseline * 0) /
        total;
    return Math.round(score);
}

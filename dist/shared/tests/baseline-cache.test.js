"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var baseline_1 = require("../baseline");
var cache_1 = require("../cache");
(0, vitest_1.describe)('Baseline with Caching Integration', function () {
    (0, vitest_1.beforeEach)(function () {
        (0, cache_1.clearAllCaches)();
    });
    (0, vitest_1.describe)('getFeatureById with cache', function () {
        (0, vitest_1.it)('should cache feature lookups', function () {
            // First call - cache miss
            var feature1 = (0, baseline_1.getFeatureById)('grid');
            (0, vitest_1.expect)(feature1).toBeDefined();
            (0, vitest_1.expect)(feature1 === null || feature1 === void 0 ? void 0 : feature1.id).toBe('grid');
            // Check that it's in cache
            var cacheKey = "feature:grid";
            var cached = cache_1.featureCache.get(cacheKey);
            (0, vitest_1.expect)(cached).toBeDefined();
            (0, vitest_1.expect)(cached === null || cached === void 0 ? void 0 : cached.id).toBe('grid');
            // Second call - cache hit (should be same object reference)
            var feature2 = (0, baseline_1.getFeatureById)('grid');
            (0, vitest_1.expect)(feature2).toBe(cached);
        });
        (0, vitest_1.it)('should handle cache for multiple features', function () {
            var feature1 = (0, baseline_1.getFeatureById)('grid');
            var feature2 = (0, baseline_1.getFeatureById)('subgrid');
            var feature3 = (0, baseline_1.getFeatureById)('container-queries');
            (0, vitest_1.expect)(feature1 === null || feature1 === void 0 ? void 0 : feature1.id).toBe('grid');
            (0, vitest_1.expect)(feature2 === null || feature2 === void 0 ? void 0 : feature2.id).toBe('subgrid');
            (0, vitest_1.expect)(feature3 === null || feature3 === void 0 ? void 0 : feature3.id).toBe('container-queries');
            // All should be cached
            (0, vitest_1.expect)(cache_1.featureCache.has('feature:grid')).toBe(true);
            (0, vitest_1.expect)(cache_1.featureCache.has('feature:subgrid')).toBe(true);
            (0, vitest_1.expect)(cache_1.featureCache.has('feature:container-queries')).toBe(true);
        });
        (0, vitest_1.it)('should return undefined for non-existent features and not cache them', function () {
            var feature = (0, baseline_1.getFeatureById)('non-existent-feature-xyz');
            (0, vitest_1.expect)(feature).toBeUndefined();
            // Should not cache undefined results
            var cached = cache_1.featureCache.get('feature:non-existent-feature-xyz');
            (0, vitest_1.expect)(cached).toBeUndefined();
        });
        (0, vitest_1.it)('should cache multiple lookups of same feature', function () {
            // Perform 10 lookups
            for (var i = 0; i < 10; i++) {
                var feature = (0, baseline_1.getFeatureById)('grid');
                (0, vitest_1.expect)(feature).toBeDefined();
            }
            // Should only have 1 cache entry (not 10)
            var stats = cache_1.featureCache.getStats();
            (0, vitest_1.expect)(stats.entries).toBe(1);
        });
    });
});

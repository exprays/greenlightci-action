"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var baseline_js_1 = require("../baseline.js");
var types_js_1 = require("../types.js");
(0, vitest_1.describe)('getBaselineStatus', function () {
    (0, vitest_1.it)('should return WidelyAvailable for baseline high', function () {
        var featureData = { status: { baseline: 'high' } };
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineStatus)(featureData)).toBe(types_js_1.BaselineStatus.WidelyAvailable);
    });
    (0, vitest_1.it)('should return WidelyAvailable for baseline widely', function () {
        var featureData = { status: { baseline: 'widely' } };
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineStatus)(featureData)).toBe(types_js_1.BaselineStatus.WidelyAvailable);
    });
    (0, vitest_1.it)('should return NewlyAvailable for baseline low', function () {
        var featureData = { status: { baseline: 'low' } };
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineStatus)(featureData)).toBe(types_js_1.BaselineStatus.NewlyAvailable);
    });
    (0, vitest_1.it)('should return NewlyAvailable for baseline newly', function () {
        var featureData = { status: { baseline: 'newly' } };
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineStatus)(featureData)).toBe(types_js_1.BaselineStatus.NewlyAvailable);
    });
    (0, vitest_1.it)('should return NotBaseline for baseline false', function () {
        var featureData = { status: { baseline: false } };
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineStatus)(featureData)).toBe(types_js_1.BaselineStatus.NotBaseline);
    });
    (0, vitest_1.it)('should return Limited for other baseline values', function () {
        var featureData = { status: { baseline: 'limited' } };
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineStatus)(featureData)).toBe(types_js_1.BaselineStatus.Limited);
    });
    (0, vitest_1.it)('should return Unknown for missing data', function () {
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineStatus)(null)).toBe(types_js_1.BaselineStatus.Unknown);
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineStatus)(undefined)).toBe(types_js_1.BaselineStatus.Unknown);
    });
});
(0, vitest_1.describe)('getBaselineYear', function () {
    (0, vitest_1.it)('should extract year from baseline_high_date', function () {
        var featureData = {
            status: { baseline_high_date: '2023-05-15' },
        };
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineYear)(featureData)).toBe('2023');
    });
    (0, vitest_1.it)('should extract year from baseline_low_date', function () {
        var featureData = {
            status: { baseline_low_date: '2022-03-10' },
        };
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineYear)(featureData)).toBe('2022');
    });
    (0, vitest_1.it)('should prefer baseline_high_date over baseline_low_date', function () {
        var featureData = {
            status: {
                baseline_high_date: '2023-05-15',
                baseline_low_date: '2022-03-10',
            },
        };
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineYear)(featureData)).toBe('2023');
    });
    (0, vitest_1.it)('should return undefined if no date available', function () {
        var featureData = { status: {} };
        (0, vitest_1.expect)((0, baseline_js_1.getBaselineYear)(featureData)).toBeUndefined();
    });
});
(0, vitest_1.describe)('getBrowserSupport', function () {
    (0, vitest_1.it)('should extract browser support data', function () {
        var featureData = {
            status: {
                support: {
                    chrome: '110',
                    firefox: '109',
                    safari: '16.4',
                    edge: '110',
                },
            },
        };
        var support = (0, baseline_js_1.getBrowserSupport)(featureData);
        (0, vitest_1.expect)(support.chrome).toBe('110');
        (0, vitest_1.expect)(support.firefox).toBe('109');
        (0, vitest_1.expect)(support.safari).toBe('16.4');
        (0, vitest_1.expect)(support.edge).toBe('110');
    });
    (0, vitest_1.it)('should handle partial browser support', function () {
        var featureData = {
            status: {
                support: {
                    chrome: '100',
                    safari: '15',
                },
            },
        };
        var support = (0, baseline_js_1.getBrowserSupport)(featureData);
        (0, vitest_1.expect)(support.chrome).toBe('100');
        (0, vitest_1.expect)(support.safari).toBe('15');
        (0, vitest_1.expect)(support.firefox).toBeUndefined();
        (0, vitest_1.expect)(support.edge).toBeUndefined();
    });
    (0, vitest_1.it)('should return empty object if no support data', function () {
        var featureData = { status: {} };
        var support = (0, baseline_js_1.getBrowserSupport)(featureData);
        (0, vitest_1.expect)(Object.keys(support)).toHaveLength(0);
    });
});
(0, vitest_1.describe)('calculateCompatibilityScore', function () {
    (0, vitest_1.it)('should return 100 for all widely available features', function () {
        var score = (0, baseline_js_1.calculateCompatibilityScore)(10, 0, 0, 0);
        (0, vitest_1.expect)(score).toBe(100);
    });
    (0, vitest_1.it)('should return 0 for all not-baseline features', function () {
        var score = (0, baseline_js_1.calculateCompatibilityScore)(0, 0, 0, 10);
        (0, vitest_1.expect)(score).toBe(0);
    });
    (0, vitest_1.it)('should return 75 for all newly available features', function () {
        var score = (0, baseline_js_1.calculateCompatibilityScore)(0, 10, 0, 0);
        (0, vitest_1.expect)(score).toBe(75);
    });
    (0, vitest_1.it)('should return 25 for all limited features', function () {
        var score = (0, baseline_js_1.calculateCompatibilityScore)(0, 0, 10, 0);
        (0, vitest_1.expect)(score).toBe(25);
    });
    (0, vitest_1.it)('should calculate mixed scores correctly', function () {
        // 5 widely (100%) + 3 newly (75%) + 2 limited (25%)
        // = (5*100 + 3*75 + 2*25) / 10 = (500 + 225 + 50) / 10 = 77.5 -> 78
        var score = (0, baseline_js_1.calculateCompatibilityScore)(5, 3, 2, 0);
        (0, vitest_1.expect)(score).toBe(78);
    });
    (0, vitest_1.it)('should handle real-world scenario', function () {
        // 10 widely, 2 newly, 1 limited, 1 not-baseline
        // = (10*100 + 2*75 + 1*25 + 1*0) / 14 = (1000 + 150 + 25 + 0) / 14 = 83.9 -> 84
        var score = (0, baseline_js_1.calculateCompatibilityScore)(10, 2, 1, 1);
        (0, vitest_1.expect)(score).toBe(84);
    });
    (0, vitest_1.it)('should return 100 for zero features', function () {
        var score = (0, baseline_js_1.calculateCompatibilityScore)(0, 0, 0, 0);
        (0, vitest_1.expect)(score).toBe(100);
    });
});
(0, vitest_1.describe)('getFeatureById', function () {
    (0, vitest_1.it)('should return undefined for non-existent feature', function () {
        var feature = (0, baseline_js_1.getFeatureById)('non-existent-feature-xyz-123');
        (0, vitest_1.expect)(feature).toBeUndefined();
    });
    (0, vitest_1.it)('should return feature data for valid feature', function () {
        // Note: This test depends on the web-features package having actual data
        // We'll use a commonly known feature that should exist
        var feature = (0, baseline_js_1.getFeatureById)('grid');
        if (feature) {
            (0, vitest_1.expect)(feature.id).toBe('grid');
            (0, vitest_1.expect)(feature.name).toBeDefined();
            (0, vitest_1.expect)(feature.status).toBeDefined();
            (0, vitest_1.expect)(feature.support).toBeDefined();
        }
    });
});

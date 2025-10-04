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
var vitest_1 = require("vitest");
var cache_1 = require("../cache");
(0, vitest_1.describe)('Cache', function () {
    var cache;
    (0, vitest_1.beforeEach)(function () {
        cache = new cache_1.Cache(1); // 1 second TTL for testing
    });
    (0, vitest_1.describe)('set and get', function () {
        (0, vitest_1.it)('should store and retrieve values', function () {
            cache.set('key1', 'value1');
            (0, vitest_1.expect)(cache.get('key1')).toBe('value1');
        });
        (0, vitest_1.it)('should return undefined for non-existent keys', function () {
            (0, vitest_1.expect)(cache.get('non-existent')).toBeUndefined();
        });
        (0, vitest_1.it)('should support custom TTL per key', function () {
            cache.set('key1', 'value1', 10); // 10 seconds
            (0, vitest_1.expect)(cache.get('key1')).toBe('value1');
        });
    });
    (0, vitest_1.describe)('has', function () {
        (0, vitest_1.it)('should return true for existing keys', function () {
            cache.set('key1', 'value1');
            (0, vitest_1.expect)(cache.has('key1')).toBe(true);
        });
        (0, vitest_1.it)('should return false for non-existent keys', function () {
            (0, vitest_1.expect)(cache.has('non-existent')).toBe(false);
        });
        (0, vitest_1.it)('should return false for expired keys', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cache.set('key1', 'value1', 0.001); // Very short TTL
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10); })];
                    case 1:
                        _a.sent(); // Wait for expiry
                        (0, vitest_1.expect)(cache.has('key1')).toBe(false);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('delete', function () {
        (0, vitest_1.it)('should remove keys', function () {
            cache.set('key1', 'value1');
            (0, vitest_1.expect)(cache.delete('key1')).toBe(true);
            (0, vitest_1.expect)(cache.get('key1')).toBeUndefined();
        });
        (0, vitest_1.it)('should return false when deleting non-existent keys', function () {
            (0, vitest_1.expect)(cache.delete('non-existent')).toBe(false);
        });
    });
    (0, vitest_1.describe)('clear', function () {
        (0, vitest_1.it)('should remove all entries', function () {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            cache.clear();
            (0, vitest_1.expect)(cache.get('key1')).toBeUndefined();
            (0, vitest_1.expect)(cache.get('key2')).toBeUndefined();
        });
    });
    (0, vitest_1.describe)('prune', function () {
        (0, vitest_1.it)('should remove expired entries only', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cache.set('key1', 'value1', 10); // Long TTL
                        cache.set('key2', 'value2', 0.001); // Very short TTL
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 10); })];
                    case 1:
                        _a.sent(); // Wait for key2 to expire
                        cache.prune();
                        (0, vitest_1.expect)(cache.get('key1')).toBe('value1');
                        (0, vitest_1.expect)(cache.get('key2')).toBeUndefined();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    (0, vitest_1.describe)('getStats', function () {
        (0, vitest_1.it)('should return cache statistics', function () {
            cache.set('key1', 'value1');
            cache.set('key2', 'value2');
            var stats = cache.getStats();
            (0, vitest_1.expect)(stats.entries).toBe(2);
            (0, vitest_1.expect)(stats.size).toBe(2);
        });
    });
    (0, vitest_1.describe)('getOrSet', function () {
        (0, vitest_1.it)('should return cached value if available', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cache.set('key1', 'cached-value');
                        return [4 /*yield*/, cache.getOrSet('key1', function () { return 'new-value'; })];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result).toBe('cached-value');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should call factory and cache result if not available', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cache.getOrSet('key1', function () { return 'factory-value'; })];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result).toBe('factory-value');
                        (0, vitest_1.expect)(cache.get('key1')).toBe('factory-value');
                        return [2 /*return*/];
                }
            });
        }); });
        (0, vitest_1.it)('should work with async factories', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, cache.getOrSet('key1', function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1); })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/, 'async-value'];
                                }
                            });
                        }); })];
                    case 1:
                        result = _a.sent();
                        (0, vitest_1.expect)(result).toBe('async-value');
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
(0, vitest_1.describe)('Cache key generators', function () {
    (0, vitest_1.it)('should generate feature cache key', function () {
        (0, vitest_1.expect)((0, cache_1.getFeatureCacheKey)('grid')).toBe('feature:grid');
    });
    (0, vitest_1.it)('should generate PR diff cache key', function () {
        (0, vitest_1.expect)((0, cache_1.getPRDiffCacheKey)('owner', 'repo', 123)).toBe('pr-diff:owner/repo/123');
    });
    (0, vitest_1.it)('should generate compatibility cache key', function () {
        var targets = { chrome: '110', firefox: '109' };
        var key = (0, cache_1.getCompatibilityCacheKey)('grid', targets);
        (0, vitest_1.expect)(key).toContain('compat:grid:');
        (0, vitest_1.expect)(key).toContain('chrome');
        (0, vitest_1.expect)(key).toContain('110');
    });
});
(0, vitest_1.describe)('Global cache instances', function () {
    (0, vitest_1.beforeEach)(function () {
        (0, cache_1.clearAllCaches)();
    });
    (0, vitest_1.it)('should have separate feature, github, and diff caches', function () {
        cache_1.featureCache.set('test', 'feature-value');
        cache_1.githubCache.set('test', 'github-value');
        cache_1.diffCache.set('test', 'diff-value');
        (0, vitest_1.expect)(cache_1.featureCache.get('test')).toBe('feature-value');
        (0, vitest_1.expect)(cache_1.githubCache.get('test')).toBe('github-value');
        (0, vitest_1.expect)(cache_1.diffCache.get('test')).toBe('diff-value');
    });
    (0, vitest_1.it)('should provide cache statistics for all caches', function () {
        cache_1.featureCache.set('key1', 'value1');
        cache_1.githubCache.set('key2', 'value2');
        cache_1.diffCache.set('key3', 'value3');
        var stats = (0, cache_1.getCacheStats)();
        (0, vitest_1.expect)(stats.features.entries).toBe(1);
        (0, vitest_1.expect)(stats.github.entries).toBe(1);
        (0, vitest_1.expect)(stats.diff.entries).toBe(1);
    });
    (0, vitest_1.it)('should prune all caches', function () {
        cache_1.featureCache.set('key1', 'value1');
        cache_1.githubCache.set('key2', 'value2');
        cache_1.diffCache.set('key3', 'value3');
        (0, cache_1.pruneAllCaches)();
        // Values should still be there (not expired yet)
        (0, vitest_1.expect)(cache_1.featureCache.get('key1')).toBe('value1');
        (0, vitest_1.expect)(cache_1.githubCache.get('key2')).toBe('value2');
        (0, vitest_1.expect)(cache_1.diffCache.get('key3')).toBe('value3');
    });
    (0, vitest_1.it)('should clear all caches', function () {
        cache_1.featureCache.set('key1', 'value1');
        cache_1.githubCache.set('key2', 'value2');
        cache_1.diffCache.set('key3', 'value3');
        (0, cache_1.clearAllCaches)();
        (0, vitest_1.expect)(cache_1.featureCache.get('key1')).toBeUndefined();
        (0, vitest_1.expect)(cache_1.githubCache.get('key2')).toBeUndefined();
        (0, vitest_1.expect)(cache_1.diffCache.get('key3')).toBeUndefined();
    });
});

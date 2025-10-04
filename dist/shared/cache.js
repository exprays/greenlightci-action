"use strict";
/**
 * Simple in-memory cache for web-features data and GitHub API responses
 */
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
exports.diffCache = exports.githubCache = exports.featureCache = exports.Cache = void 0;
exports.getFeatureCacheKey = getFeatureCacheKey;
exports.getPRDiffCacheKey = getPRDiffCacheKey;
exports.getCompatibilityCacheKey = getCompatibilityCacheKey;
exports.getCacheStats = getCacheStats;
exports.pruneAllCaches = pruneAllCaches;
exports.clearAllCaches = clearAllCaches;
var Cache = /** @class */ (function () {
    function Cache(defaultTTLSeconds) {
        if (defaultTTLSeconds === void 0) { defaultTTLSeconds = 3600; }
        this.store = new Map();
        this.defaultTTL = defaultTTLSeconds * 1000; // Convert to milliseconds
    }
    /**
     * Set a value in the cache
     */
    Cache.prototype.set = function (key, data, ttl) {
        var now = Date.now();
        var expiresAt = now + (ttl ? ttl * 1000 : this.defaultTTL);
        this.store.set(key, {
            data: data,
            timestamp: now,
            expiresAt: expiresAt,
        });
    };
    /**
     * Get a value from the cache
     * Returns undefined if not found or expired
     */
    Cache.prototype.get = function (key) {
        var entry = this.store.get(key);
        if (!entry) {
            return undefined;
        }
        // Check if expired
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.data;
    };
    /**
     * Check if a key exists and is not expired
     */
    Cache.prototype.has = function (key) {
        var entry = this.store.get(key);
        if (!entry) {
            return false;
        }
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return false;
        }
        return true;
    };
    /**
     * Delete a key from the cache
     */
    Cache.prototype.delete = function (key) {
        return this.store.delete(key);
    };
    /**
     * Clear all entries from the cache
     */
    Cache.prototype.clear = function () {
        this.store.clear();
    };
    /**
     * Remove all expired entries
     */
    Cache.prototype.prune = function () {
        var _this = this;
        var now = Date.now();
        this.store.forEach(function (entry, key) {
            if (now > entry.expiresAt) {
                _this.store.delete(key);
            }
        });
    };
    /**
     * Get cache statistics
     */
    Cache.prototype.getStats = function () {
        return {
            size: this.store.size,
            entries: this.store.size,
        };
    };
    /**
     * Get or set a value using a factory function
     */
    Cache.prototype.getOrSet = function (key, factory, ttl) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cached = this.get(key);
                        if (cached !== undefined) {
                            return [2 /*return*/, cached];
                        }
                        return [4 /*yield*/, factory()];
                    case 1:
                        data = _a.sent();
                        this.set(key, data, ttl);
                        return [2 /*return*/, data];
                }
            });
        });
    };
    return Cache;
}());
exports.Cache = Cache;
/**
 * Global cache instances
 */
// Cache for web-features data (long TTL since features don't change often)
exports.featureCache = new Cache(86400); // 24 hours
// Cache for GitHub API responses (shorter TTL)
exports.githubCache = new Cache(300); // 5 minutes
// Cache for parsed diffs
exports.diffCache = new Cache(600); // 10 minutes
/**
 * Generate cache key for feature lookup
 */
function getFeatureCacheKey(featureId) {
    return "feature:".concat(featureId);
}
/**
 * Generate cache key for PR diff
 */
function getPRDiffCacheKey(owner, repo, pullNumber) {
    return "pr-diff:".concat(owner, "/").concat(repo, "/").concat(pullNumber);
}
/**
 * Generate cache key for compatibility check
 */
function getCompatibilityCacheKey(featureId, targets) {
    var targetsStr = JSON.stringify(targets);
    return "compat:".concat(featureId, ":").concat(targetsStr);
}
/**
 * Cache statistics and monitoring
 */
function getCacheStats() {
    return {
        features: exports.featureCache.getStats(),
        github: exports.githubCache.getStats(),
        diff: exports.diffCache.getStats(),
    };
}
/**
 * Prune all caches
 */
function pruneAllCaches() {
    exports.featureCache.prune();
    exports.githubCache.prune();
    exports.diffCache.prune();
}
/**
 * Clear all caches
 */
function clearAllCaches() {
    exports.featureCache.clear();
    exports.githubCache.clear();
    exports.diffCache.clear();
}

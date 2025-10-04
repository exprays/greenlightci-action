/**
 * Simple in-memory cache for web-features data and GitHub API responses
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class Cache<T> {
  private store: Map<string, CacheEntry<T>>;
  private defaultTTL: number;

  constructor(defaultTTLSeconds: number = 3600) {
    this.store = new Map();
    this.defaultTTL = defaultTTLSeconds * 1000; // Convert to milliseconds
  }

  /**
   * Set a value in the cache
   */
  set(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl ? ttl * 1000 : this.defaultTTL);

    this.store.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  /**
   * Get a value from the cache
   * Returns undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.store.get(key);

    if (!entry) {
      return undefined;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.data;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.store.get(key);

    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Remove all expired entries
   */
  prune(): void {
    const now = Date.now();
    this.store.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    });
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; entries: number } {
    return {
      size: this.store.size,
      entries: this.store.size,
    };
  }

  /**
   * Get or set a value using a factory function
   */
  async getOrSet(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = this.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, ttl);
    return data;
  }
}

/**
 * Global cache instances
 */

// Cache for web-features data (long TTL since features don't change often)
export const featureCache = new Cache<any>(86400); // 24 hours

// Cache for GitHub API responses (shorter TTL)
export const githubCache = new Cache<any>(300); // 5 minutes

// Cache for parsed diffs
export const diffCache = new Cache<any>(600); // 10 minutes

/**
 * Generate cache key for feature lookup
 */
export function getFeatureCacheKey(featureId: string): string {
  return `feature:${featureId}`;
}

/**
 * Generate cache key for PR diff
 */
export function getPRDiffCacheKey(
  owner: string,
  repo: string,
  pullNumber: number
): string {
  return `pr-diff:${owner}/${repo}/${pullNumber}`;
}

/**
 * Generate cache key for compatibility check
 */
export function getCompatibilityCacheKey(
  featureId: string,
  targets: Record<string, string>
): string {
  const targetsStr = JSON.stringify(targets);
  return `compat:${featureId}:${targetsStr}`;
}

/**
 * Cache statistics and monitoring
 */
export function getCacheStats() {
  return {
    features: featureCache.getStats(),
    github: githubCache.getStats(),
    diff: diffCache.getStats(),
  };
}

/**
 * Prune all caches
 */
export function pruneAllCaches(): void {
  featureCache.prune();
  githubCache.prune();
  diffCache.prune();
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  featureCache.clear();
  githubCache.clear();
  diffCache.clear();
}

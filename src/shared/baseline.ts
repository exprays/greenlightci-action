import { BaselineFeature, BaselineStatus, BrowserSupport } from "./types.js";
import { featureCache, getFeatureCacheKey } from "./cache.js";
import { wrapError } from "./errors.js";

// Cache for web-features data
let webFeaturesData: Record<string, any> | null = null;
let webFeaturesPromise: Promise<Record<string, any>> | null = null;

/**
 * Dynamically load web-features data using dynamic import
 * web-features is an ES module and must be imported dynamically
 * We use Function constructor to prevent TypeScript from transforming the dynamic import
 */
async function loadWebFeatures(): Promise<Record<string, any>> {
  if (webFeaturesData !== null) {
    return webFeaturesData;
  }

  if (webFeaturesPromise !== null) {
    return webFeaturesPromise;
  }

  webFeaturesPromise = (async () => {
    // Try multiple strategies to load the `web-features` package. Some
    // environments (bundled CommonJS) can't require an ESM-only package,
    // so we attempt dynamic import first, then fallback to require, and
    // finally fall back to a shipped JSON snapshot (dist/index.json) when
    // appropriate.
    try {
      // Prefer a dynamic import so ESM-only packages load correctly.
      const dynamicImport = new Function(
        "specifier",
        "return import(specifier)"
      );
      const mod = await dynamicImport("web-features");

      // Handle different export formats:
      // - v0.x: default export is the features object
      // - v3.x: named export { features, browsers, groups, snapshots }
      if (mod.features && typeof mod.features === "object") {
        webFeaturesData = mod.features;
      } else if (mod.default && typeof mod.default === "object") {
        webFeaturesData = mod.default;
      } else {
        webFeaturesData = mod;
      }

      return webFeaturesData;
    } catch (error: any) {
      // Dynamic import failed (could be transformed to require during bundling)
      // Try a plain require first (works in many dev setups).
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require("web-features");

        // Handle different export formats
        if (mod.features && typeof mod.features === "object") {
          webFeaturesData = mod.features;
        } else if (mod.default && typeof mod.default === "object") {
          webFeaturesData = mod.default;
        } else {
          webFeaturesData = mod;
        }

        return webFeaturesData;
      } catch (requireErr: any) {
        // If require fails because `web-features` is ESM (ERR_REQUIRE_ESM),
        // try to load a local JSON snapshot that we include with the action
        // bundle (dist/index.json). This makes the action robust when
        // running as CommonJS.
        const isESMError = requireErr && requireErr.code === "ERR_REQUIRE_ESM";

        if (isESMError) {
          try {
            // Resolve the dist JSON relative to this compiled file.
            // When running from `dist/shared`, `../index.json` should point
            // to the bundled JSON file placed next to `dist/index.js`.
            // Use require with a computed path.
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const path = require("path");
            const jsonPath = path.resolve(__dirname, "../index.json");
            const snapshot = require(jsonPath);
            webFeaturesData = snapshot.default || snapshot || {};
            return webFeaturesData;
          } catch (snapErr) {
            console.error(
              "Failed to load local web-features snapshot:",
              snapErr
            );
            webFeaturesData = {};
            return webFeaturesData;
          }
        }

        console.error(
          "Failed to load web-features (require/import):",
          requireErr
        );
        webFeaturesData = {};
        return webFeaturesData;
      }
    }
  })();

  return webFeaturesPromise;
}

/**
 * Synchronous wrapper for backwards compatibility
 * This will throw if called before features are loaded
 */
function getWebFeatures(): Record<string, any> {
  if (webFeaturesData === null) {
    throw new Error(
      "Web features not loaded yet. Call loadWebFeatures() first."
    );
  }
  return webFeaturesData;
}

/**
 * Get baseline status from web-features data
 */
export function getBaselineStatus(featureData: any): BaselineStatus {
  if (!featureData) {
    return BaselineStatus.Unknown;
  }

  const baseline = featureData.status?.baseline;

  if (baseline === "high" || baseline === "widely") {
    return BaselineStatus.WidelyAvailable;
  }

  if (baseline === "low" || baseline === "newly") {
    return BaselineStatus.NewlyAvailable;
  }

  if (baseline === false) {
    return BaselineStatus.NotBaseline;
  }

  return BaselineStatus.Limited;
}

/**
 * Get baseline year from feature data
 */
export function getBaselineYear(featureData: any): string | undefined {
  const baselineDate =
    featureData.status?.baseline_high_date ||
    featureData.status?.baseline_low_date;

  if (baselineDate) {
    return new Date(baselineDate).getFullYear().toString();
  }

  return undefined;
}

/**
 * Extract browser support information
 */
export function getBrowserSupport(featureData: any): BrowserSupport {
  const support: BrowserSupport = {};

  if (featureData.status?.support) {
    const supportData = featureData.status.support;

    if (supportData.chrome) support.chrome = supportData.chrome;
    if (supportData.edge) support.edge = supportData.edge;
    if (supportData.firefox) support.firefox = supportData.firefox;
    if (supportData.safari) support.safari = supportData.safari;
  }

  return support;
}

/**
 * Get all baseline features from web-features package
 */
export async function getAllBaselineFeatures(): Promise<
  Map<string, BaselineFeature>
> {
  const featureMap = new Map<string, BaselineFeature>();
  const features = await loadWebFeatures();

  // web-features is an object with feature IDs as keys
  for (const [featureId, featureData] of Object.entries(features)) {
    const status = getBaselineStatus(featureData);
    const baselineYear = getBaselineYear(featureData);
    const support = getBrowserSupport(featureData);

    const baselineFeature: BaselineFeature = {
      id: featureId,
      name: (featureData as any).name || featureId,
      description: (featureData as any).description,
      status,
      ...(baselineYear ? { baselineYear } : {}),
      support,
      mdnUrl: (featureData as any).mdn_url,
      specUrl: (featureData as any).spec,
    };

    featureMap.set(featureId, baselineFeature);
  }

  return featureMap;
}

/**
 * Find feature by ID (with caching)
 */
export async function getFeatureById(
  featureId: string
): Promise<BaselineFeature | undefined> {
  try {
    // Validate input
    if (!featureId || typeof featureId !== "string") {
      console.warn(`Invalid feature ID: ${featureId}`);
      return undefined;
    }

    // Check cache first
    const cacheKey = getFeatureCacheKey(featureId);
    const cached = featureCache.get(cacheKey);

    if (cached !== undefined) {
      return cached;
    }

    // Fetch from web-features
    const features = await loadWebFeatures();

    // Handle empty features data
    if (!features || Object.keys(features).length === 0) {
      console.warn(`Web features data is empty or not loaded`);
      return undefined;
    }

    const featureData = (features as any)[featureId];

    if (!featureData) {
      // Feature not found - this is normal, just return undefined
      return undefined;
    }

    const status = getBaselineStatus(featureData);
    const baselineYear = getBaselineYear(featureData);
    const support = getBrowserSupport(featureData);

    const feature: BaselineFeature = {
      id: featureId,
      name: featureData.name || featureId,
      description: featureData.description,
      status,
      ...(baselineYear ? { baselineYear } : {}),
      support,
      mdnUrl: featureData.mdn_url,
      specUrl: featureData.spec,
    };

    // Cache the result (24 hour TTL)
    featureCache.set(cacheKey, feature, 86400);

    return feature;
  } catch (error) {
    // Log the error but don't throw - return undefined instead
    console.error(`Error getting feature by ID ${featureId}:`, error);
    return undefined;
  }
}

/**
 * Calculate compatibility score (0-100)
 */
export function calculateCompatibilityScore(
  widelyAvailable: number,
  newlyAvailable: number,
  limited: number,
  notBaseline: number
): number {
  const total = widelyAvailable + newlyAvailable + limited + notBaseline;

  if (total === 0) {
    return 100;
  }

  // Weighted scoring:
  // Widely Available: 100% weight
  // Newly Available: 75% weight
  // Limited: 25% weight
  // Not Baseline: 0% weight
  const score =
    (widelyAvailable * 100 +
      newlyAvailable * 75 +
      limited * 25 +
      notBaseline * 0) /
    total;

  return Math.round(score);
}

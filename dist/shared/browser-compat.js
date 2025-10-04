"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCompatibleWithTargets = isCompatibleWithTargets;
exports.compareVersions = compareVersions;
exports.parseCustomTargets = parseCustomTargets;
/**
 * Check if feature is compatible with custom browser targets
 */
function isCompatibleWithTargets(featureSupport, customTargets) {
    var incompatibleBrowsers = [];
    // Check each browser in custom targets
    for (var _i = 0, _a = Object.entries(customTargets); _i < _a.length; _i++) {
        var _b = _a[_i], browser = _b[0], targetVersion = _b[1];
        var featureVersion = featureSupport[browser];
        if (!featureVersion) {
            // Feature not supported in this browser at all
            incompatibleBrowsers.push("".concat(browser, " (not supported)"));
            continue;
        }
        // Compare versions
        if (compareVersions(featureVersion, targetVersion) > 0) {
            // Feature requires newer version than target
            incompatibleBrowsers.push("".concat(browser, " (requires ").concat(featureVersion, "+, target is ").concat(targetVersion, ")"));
        }
    }
    return {
        compatible: incompatibleBrowsers.length === 0,
        incompatibleBrowsers: incompatibleBrowsers,
    };
}
/**
 * Compare two version strings
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
    var parts1 = v1.split('.').map(function (n) { return parseInt(n, 10) || 0; });
    var parts2 = v2.split('.').map(function (n) { return parseInt(n, 10) || 0; });
    var maxLength = Math.max(parts1.length, parts2.length);
    for (var i = 0; i < maxLength; i++) {
        var num1 = parts1[i] || 0;
        var num2 = parts2[i] || 0;
        if (num1 > num2)
            return 1;
        if (num1 < num2)
            return -1;
    }
    return 0;
}
/**
 * Parse custom browser targets from JSON string
 */
function parseCustomTargets(targetsJson) {
    if (!targetsJson || targetsJson.trim() === '') {
        return null;
    }
    try {
        var parsed = JSON.parse(targetsJson);
        // Validate the structure
        var validBrowsers = ['chrome', 'edge', 'firefox', 'safari'];
        var targets = {};
        for (var _i = 0, _a = Object.entries(parsed); _i < _a.length; _i++) {
            var _b = _a[_i], browser = _b[0], version = _b[1];
            if (validBrowsers.includes(browser.toLowerCase())) {
                targets[browser.toLowerCase()] =
                    String(version);
            }
        }
        return Object.keys(targets).length > 0 ? targets : null;
    }
    catch (error) {
        throw new Error("Invalid custom-browser-targets JSON: ".concat(error));
    }
}

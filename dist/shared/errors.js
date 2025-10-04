"use strict";
/**
 * Custom error classes for better error handling and reporting
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.CacheError = exports.CompatibilityError = exports.ConfigurationError = exports.FeatureDetectionError = exports.ParseError = exports.GitHubAPIError = exports.GreenLightError = void 0;
exports.wrapError = wrapError;
exports.isErrorType = isErrorType;
exports.formatErrorForLog = formatErrorForLog;
exports.getUserFriendlyError = getUserFriendlyError;
/**
 * Base error class for GreenLightCI errors
 */
var GreenLightError = /** @class */ (function (_super) {
    __extends(GreenLightError, _super);
    function GreenLightError(message, code, details) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.details = details;
        _this.name = 'GreenLightError';
        // Maintains proper stack trace for where error was thrown (if available)
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(_this, _this.constructor);
        }
        return _this;
    }
    GreenLightError.prototype.toJSON = function () {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            details: this.details,
            stack: this.stack,
        };
    };
    return GreenLightError;
}(Error));
exports.GreenLightError = GreenLightError;
/**
 * Error when GitHub API operations fail
 */
var GitHubAPIError = /** @class */ (function (_super) {
    __extends(GitHubAPIError, _super);
    function GitHubAPIError(message, statusCode, details) {
        var _this = _super.call(this, message, 'GITHUB_API_ERROR', __assign(__assign({}, details), { statusCode: statusCode })) || this;
        _this.statusCode = statusCode;
        _this.name = 'GitHubAPIError';
        return _this;
    }
    return GitHubAPIError;
}(GreenLightError));
exports.GitHubAPIError = GitHubAPIError;
/**
 * Error when parsing diffs fails
 */
var ParseError = /** @class */ (function (_super) {
    __extends(ParseError, _super);
    function ParseError(message, details) {
        var _this = _super.call(this, message, 'PARSE_ERROR', details) || this;
        _this.name = 'ParseError';
        return _this;
    }
    return ParseError;
}(GreenLightError));
exports.ParseError = ParseError;
/**
 * Error when feature detection fails
 */
var FeatureDetectionError = /** @class */ (function (_super) {
    __extends(FeatureDetectionError, _super);
    function FeatureDetectionError(message, featureId, details) {
        var _this = _super.call(this, message, 'FEATURE_DETECTION_ERROR', __assign(__assign({}, details), { featureId: featureId })) || this;
        _this.featureId = featureId;
        _this.name = 'FeatureDetectionError';
        return _this;
    }
    return FeatureDetectionError;
}(GreenLightError));
exports.FeatureDetectionError = FeatureDetectionError;
/**
 * Error when configuration is invalid
 */
var ConfigurationError = /** @class */ (function (_super) {
    __extends(ConfigurationError, _super);
    function ConfigurationError(message, details) {
        var _this = _super.call(this, message, 'CONFIGURATION_ERROR', details) || this;
        _this.name = 'ConfigurationError';
        return _this;
    }
    return ConfigurationError;
}(GreenLightError));
exports.ConfigurationError = ConfigurationError;
/**
 * Error when compatibility checking fails
 */
var CompatibilityError = /** @class */ (function (_super) {
    __extends(CompatibilityError, _super);
    function CompatibilityError(message, details) {
        var _this = _super.call(this, message, 'COMPATIBILITY_ERROR', details) || this;
        _this.name = 'CompatibilityError';
        return _this;
    }
    return CompatibilityError;
}(GreenLightError));
exports.CompatibilityError = CompatibilityError;
/**
 * Error when cache operations fail
 */
var CacheError = /** @class */ (function (_super) {
    __extends(CacheError, _super);
    function CacheError(message, details) {
        var _this = _super.call(this, message, 'CACHE_ERROR', details) || this;
        _this.name = 'CacheError';
        return _this;
    }
    return CacheError;
}(GreenLightError));
exports.CacheError = CacheError;
/**
 * Wrap an error with context
 */
function wrapError(error, message, code, details) {
    if (code === void 0) { code = 'UNKNOWN_ERROR'; }
    if (error instanceof GreenLightError) {
        return error;
    }
    if (error instanceof Error) {
        return new GreenLightError("".concat(message, ": ").concat(error.message), code, __assign(__assign({}, details), { originalError: error.message, originalStack: error.stack }));
    }
    return new GreenLightError("".concat(message, ": ").concat(String(error)), code, details);
}
/**
 * Check if error is of a specific type
 */
function isErrorType(error, errorClass) {
    return error instanceof errorClass;
}
/**
 * Format error for logging
 */
function formatErrorForLog(error) {
    if (error instanceof GreenLightError) {
        var parts = ["[".concat(error.code, "] ").concat(error.message)];
        if (error.details && Object.keys(error.details).length > 0) {
            parts.push("Details: ".concat(JSON.stringify(error.details, null, 2)));
        }
        if (error.stack) {
            parts.push("Stack: ".concat(error.stack));
        }
        return parts.join('\n');
    }
    if (error instanceof Error) {
        return "".concat(error.message, "\nStack: ").concat(error.stack);
    }
    return String(error);
}
/**
 * Safe error extraction for user display
 */
function getUserFriendlyError(error) {
    if (error instanceof GitHubAPIError) {
        if (error.statusCode === 404) {
            return 'Could not find the pull request. Please check that the action is triggered by a pull request event.';
        }
        if (error.statusCode === 403) {
            return 'GitHub API rate limit exceeded or insufficient permissions. Please check your github-token.';
        }
        if (error.statusCode === 401) {
            return 'GitHub authentication failed. Please check your github-token.';
        }
        return "GitHub API error: ".concat(error.message);
    }
    if (error instanceof ConfigurationError) {
        return "Configuration error: ".concat(error.message);
    }
    if (error instanceof ParseError) {
        return "Failed to parse code: ".concat(error.message);
    }
    if (error instanceof FeatureDetectionError) {
        return "Feature detection failed: ".concat(error.message);
    }
    if (error instanceof CompatibilityError) {
        return "Compatibility check failed: ".concat(error.message);
    }
    if (error instanceof GreenLightError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred';
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var errors_1 = require("../errors");
(0, vitest_1.describe)('GreenLightError', function () {
    (0, vitest_1.it)('should create error with code and details', function () {
        var error = new errors_1.GreenLightError('Test error', 'TEST_CODE', {
            foo: 'bar',
        });
        (0, vitest_1.expect)(error.message).toBe('Test error');
        (0, vitest_1.expect)(error.code).toBe('TEST_CODE');
        (0, vitest_1.expect)(error.details).toEqual({ foo: 'bar' });
        (0, vitest_1.expect)(error.name).toBe('GreenLightError');
    });
    (0, vitest_1.it)('should serialize to JSON', function () {
        var error = new errors_1.GreenLightError('Test error', 'TEST_CODE', {
            foo: 'bar',
        });
        var json = error.toJSON();
        (0, vitest_1.expect)(json.name).toBe('GreenLightError');
        (0, vitest_1.expect)(json.message).toBe('Test error');
        (0, vitest_1.expect)(json.code).toBe('TEST_CODE');
        (0, vitest_1.expect)(json.details).toEqual({ foo: 'bar' });
        (0, vitest_1.expect)(json.stack).toBeDefined();
    });
});
(0, vitest_1.describe)('GitHubAPIError', function () {
    (0, vitest_1.it)('should include status code', function () {
        var _a, _b;
        var error = new errors_1.GitHubAPIError('API failed', 404, {
            endpoint: '/api/test',
        });
        (0, vitest_1.expect)(error.message).toBe('API failed');
        (0, vitest_1.expect)(error.statusCode).toBe(404);
        (0, vitest_1.expect)(error.code).toBe('GITHUB_API_ERROR');
        (0, vitest_1.expect)((_a = error.details) === null || _a === void 0 ? void 0 : _a.statusCode).toBe(404);
        (0, vitest_1.expect)((_b = error.details) === null || _b === void 0 ? void 0 : _b.endpoint).toBe('/api/test');
    });
});
(0, vitest_1.describe)('ParseError', function () {
    (0, vitest_1.it)('should create parse error', function () {
        var _a;
        var error = new errors_1.ParseError('Failed to parse', { line: 10 });
        (0, vitest_1.expect)(error.message).toBe('Failed to parse');
        (0, vitest_1.expect)(error.code).toBe('PARSE_ERROR');
        (0, vitest_1.expect)((_a = error.details) === null || _a === void 0 ? void 0 : _a.line).toBe(10);
    });
});
(0, vitest_1.describe)('FeatureDetectionError', function () {
    (0, vitest_1.it)('should include feature ID', function () {
        var _a;
        var error = new errors_1.FeatureDetectionError('Feature not found', 'grid', {
            reason: 'invalid',
        });
        (0, vitest_1.expect)(error.message).toBe('Feature not found');
        (0, vitest_1.expect)(error.featureId).toBe('grid');
        (0, vitest_1.expect)(error.code).toBe('FEATURE_DETECTION_ERROR');
        (0, vitest_1.expect)((_a = error.details) === null || _a === void 0 ? void 0 : _a.featureId).toBe('grid');
    });
});
(0, vitest_1.describe)('ConfigurationError', function () {
    (0, vitest_1.it)('should create configuration error', function () {
        var _a;
        var error = new errors_1.ConfigurationError('Invalid config', { key: 'targets' });
        (0, vitest_1.expect)(error.message).toBe('Invalid config');
        (0, vitest_1.expect)(error.code).toBe('CONFIGURATION_ERROR');
        (0, vitest_1.expect)((_a = error.details) === null || _a === void 0 ? void 0 : _a.key).toBe('targets');
    });
});
(0, vitest_1.describe)('CompatibilityError', function () {
    (0, vitest_1.it)('should create compatibility error', function () {
        var error = new errors_1.CompatibilityError('Not compatible', {
            browser: 'chrome',
        });
        (0, vitest_1.expect)(error.message).toBe('Not compatible');
        (0, vitest_1.expect)(error.code).toBe('COMPATIBILITY_ERROR');
    });
});
(0, vitest_1.describe)('CacheError', function () {
    (0, vitest_1.it)('should create cache error', function () {
        var error = new errors_1.CacheError('Cache failed', { operation: 'set' });
        (0, vitest_1.expect)(error.message).toBe('Cache failed');
        (0, vitest_1.expect)(error.code).toBe('CACHE_ERROR');
    });
});
(0, vitest_1.describe)('wrapError', function () {
    (0, vitest_1.it)('should return GreenLightError as-is', function () {
        var original = new errors_1.GreenLightError('Original', 'CODE');
        var wrapped = (0, errors_1.wrapError)(original, 'Wrapper message', 'WRAPPER_CODE');
        (0, vitest_1.expect)(wrapped).toBe(original);
    });
    (0, vitest_1.it)('should wrap Error instances', function () {
        var _a, _b;
        var original = new Error('Original error');
        var wrapped = (0, errors_1.wrapError)(original, 'Wrapper message', 'WRAPPER_CODE', {
            context: 'test',
        });
        (0, vitest_1.expect)(wrapped).toBeInstanceOf(errors_1.GreenLightError);
        (0, vitest_1.expect)(wrapped.message).toContain('Wrapper message');
        (0, vitest_1.expect)(wrapped.message).toContain('Original error');
        (0, vitest_1.expect)(wrapped.code).toBe('WRAPPER_CODE');
        (0, vitest_1.expect)((_a = wrapped.details) === null || _a === void 0 ? void 0 : _a.originalError).toBe('Original error');
        (0, vitest_1.expect)((_b = wrapped.details) === null || _b === void 0 ? void 0 : _b.context).toBe('test');
    });
    (0, vitest_1.it)('should wrap non-Error values', function () {
        var wrapped = (0, errors_1.wrapError)('String error', 'Wrapper message', 'WRAPPER_CODE');
        (0, vitest_1.expect)(wrapped).toBeInstanceOf(errors_1.GreenLightError);
        (0, vitest_1.expect)(wrapped.message).toContain('String error');
        (0, vitest_1.expect)(wrapped.code).toBe('WRAPPER_CODE');
    });
});
(0, vitest_1.describe)('isErrorType', function () {
    (0, vitest_1.it)('should identify error types correctly', function () {
        var apiError = new errors_1.GitHubAPIError('API error', 500);
        var parseError = new errors_1.ParseError('Parse error');
        var genericError = new errors_1.GreenLightError('Generic', 'CODE');
        (0, vitest_1.expect)((0, errors_1.isErrorType)(apiError, errors_1.GitHubAPIError)).toBe(true);
        (0, vitest_1.expect)((0, errors_1.isErrorType)(apiError, errors_1.ParseError)).toBe(false);
        (0, vitest_1.expect)((0, errors_1.isErrorType)(parseError, errors_1.ParseError)).toBe(true);
        (0, vitest_1.expect)((0, errors_1.isErrorType)(genericError, errors_1.GreenLightError)).toBe(true);
    });
});
(0, vitest_1.describe)('formatErrorForLog', function () {
    (0, vitest_1.it)('should format GreenLightError with details', function () {
        var error = new errors_1.GreenLightError('Test error', 'TEST_CODE', {
            foo: 'bar',
        });
        var formatted = (0, errors_1.formatErrorForLog)(error);
        (0, vitest_1.expect)(formatted).toContain('[TEST_CODE]');
        (0, vitest_1.expect)(formatted).toContain('Test error');
        (0, vitest_1.expect)(formatted).toContain('Details:');
        (0, vitest_1.expect)(formatted).toContain('foo');
    });
    (0, vitest_1.it)('should format regular Error', function () {
        var error = new Error('Regular error');
        var formatted = (0, errors_1.formatErrorForLog)(error);
        (0, vitest_1.expect)(formatted).toContain('Regular error');
        (0, vitest_1.expect)(formatted).toContain('Stack:');
    });
    (0, vitest_1.it)('should format non-Error values', function () {
        var formatted = (0, errors_1.formatErrorForLog)('String error');
        (0, vitest_1.expect)(formatted).toBe('String error');
    });
});
(0, vitest_1.describe)('getUserFriendlyError', function () {
    (0, vitest_1.it)('should provide friendly message for GitHubAPIError 404', function () {
        var error = new errors_1.GitHubAPIError('Not found', 404);
        var message = (0, errors_1.getUserFriendlyError)(error);
        (0, vitest_1.expect)(message).toContain('pull request');
        (0, vitest_1.expect)(message).not.toContain('404');
    });
    (0, vitest_1.it)('should provide friendly message for GitHubAPIError 403', function () {
        var error = new errors_1.GitHubAPIError('Forbidden', 403);
        var message = (0, errors_1.getUserFriendlyError)(error);
        (0, vitest_1.expect)(message).toContain('rate limit');
        (0, vitest_1.expect)(message).toContain('permissions');
    });
    (0, vitest_1.it)('should provide friendly message for GitHubAPIError 401', function () {
        var error = new errors_1.GitHubAPIError('Unauthorized', 401);
        var message = (0, errors_1.getUserFriendlyError)(error);
        (0, vitest_1.expect)(message).toContain('authentication');
        (0, vitest_1.expect)(message).toContain('github-token');
    });
    (0, vitest_1.it)('should provide friendly message for ConfigurationError', function () {
        var error = new errors_1.ConfigurationError('Invalid targets');
        var message = (0, errors_1.getUserFriendlyError)(error);
        (0, vitest_1.expect)(message).toContain('Configuration error');
    });
    (0, vitest_1.it)('should provide friendly message for ParseError', function () {
        var error = new errors_1.ParseError('Invalid diff');
        var message = (0, errors_1.getUserFriendlyError)(error);
        (0, vitest_1.expect)(message).toContain('parse');
    });
    (0, vitest_1.it)('should provide friendly message for FeatureDetectionError', function () {
        var error = new errors_1.FeatureDetectionError('Detection failed', 'grid');
        var message = (0, errors_1.getUserFriendlyError)(error);
        (0, vitest_1.expect)(message).toContain('Feature detection');
    });
    (0, vitest_1.it)('should handle generic errors', function () {
        var error = new Error('Generic error');
        var message = (0, errors_1.getUserFriendlyError)(error);
        (0, vitest_1.expect)(message).toBe('Generic error');
    });
    (0, vitest_1.it)('should handle non-Error values', function () {
        var message = (0, errors_1.getUserFriendlyError)('String error');
        (0, vitest_1.expect)(message).toBe('An unknown error occurred');
    });
});

# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Fixed

- **Critical bug**: Fixed "Failed to get feature by ID: top-level-await: Invalid URL" error that caused action failures
  - Resolved ESM loading issues with `web-features` package
  - Added robust fallback strategies for CommonJS/ESM interoperability
  - Fixed feature ID mapping (e.g., `css-nesting` → `nesting`)
  - Removed detection of ECMAScript syntax features not tracked by web-features

### Changed

- **Breaking**: Upgraded `web-features` from v0.8.6 to v3.3.0
  - Now supports 1000+ features including `top-level-await`
  - Better baseline data and browser support information
  - Different export format (named `features` export instead of default export)
- Updated feature detection to only track Web Platform APIs and CSS features
- Removed detection of pure JavaScript language features (optional chaining, nullish coalescing, private fields)

### Added

- Comprehensive documentation in `BUGFIX_SUMMARY.md`
- Better error handling and logging for feature loading
- Support for both v0.x and v3.x `web-features` export formats

## [1.0.0] - Initial Release

### Added

- GitHub Action for Baseline web feature compatibility checking
- PR comment with detailed compatibility reports
- Support for custom browser targets
- Dashboard integration support
- Feature detection for CSS and JavaScript
- Polyfill suggestions

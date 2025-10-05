# 🚦 GreenLightCI - GitHub Action

[![GitHub Action](https://img.shields.io/badge/GitHub-Action-blue?logo=github)](https://github.com/exprays/greenlightci-action)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Automatically check web feature compatibility against Baseline data in your pull requests. Ensure your web applications work across all target browsers before merging code.

## ✨ Features

- 🔍 **Automatic Feature Detection** - Scans PR changes for CSS, JavaScript, and HTML features
- 📊 **Compatibility Scoring** - Provides 0-100 compatibility score based on Baseline 2023/2024
- 🚨 **Configurable Blocking** - Block PRs based on feature availability (newly available, limited, or unsupported)
- 💬 **Rich PR Comments** - Detailed compatibility reports with visual indicators and actionable insights
- 📈 **Dashboard Integration** - Send results to GreenLightCI Dashboard for tracking and analytics
- 🎯 **Custom Browser Targets** - Define your own browser support matrix beyond Baseline
- ⚡ **Fast & Efficient** - Runs in seconds with intelligent caching
- 🔒 **Secure** - Uses GitHub tokens and API keys for authentication

## 🎯 Supported Features

This action tracks **Web Platform features** using the [web-features](https://github.com/web-platform-dx/web-features) package (v3.3.0), which includes:

### CSS Features
- Modern layout: Grid, Flexbox, Container Queries, Subgrid
- Selectors: `:has()`, `:is()`, `:where()`, `:focus-visible`
- Styling: CSS Nesting, Custom Properties (CSS Variables), `color-mix()`
- And 1000+ more CSS features

### JavaScript Web APIs
- Modern APIs: `fetch`, `Promise`, `async/await`
- Modules: ES6 Modules (`import`/`export`), Top-level `await`
- DOM APIs: `IntersectionObserver`, `ResizeObserver`, `MutationObserver`
- Storage: `IndexedDB`, `localStorage`, `sessionStorage`
- And many more browser APIs

### ⚠️ Important: ECMAScript Language Features Not Tracked

This action **does not** track pure JavaScript language syntax features such as:
- Optional chaining (`?.`)
- Nullish coalescing (`??`)
- Private fields (`#field`)
- Numeric separators (`1_000_000`)

**Reason**: These are JavaScript language features that are handled by your build tools (Babel, TypeScript) and transpiled for older browsers. The `web-features` dataset focuses on **Web Platform APIs and CSS features** that require actual browser support.

For language feature compatibility, use tools like:
- [Babel](https://babeljs.io/) with appropriate presets
- [TypeScript](https://www.typescriptlang.org/) with `target` configuration
- [Can I Use](https://caniuse.com/) for manual checking

### 📋 Full Feature List

For a complete list of tracked features, see:
- [web-features GitHub Repository](https://github.com/web-platform-dx/web-features)
- [Web Platform Baseline](https://web.dev/baseline/)

## Quick Start

### Basic Usage

```yaml
name: Baseline Compatibility Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  baseline-check:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      statuses: write

    steps:
      - uses: actions/checkout@v4

      - name: Baseline Compatibility Check
        uses: exprays/greenlightci-action@v1.0.0
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          baseline-year: "2023"
          block-newly-available: false
          block-limited-availability: true
```

### With Dashboard Integration

```yaml
- name: Baseline Compatibility Check
  uses: exprays/greenlightci-action@v1.0.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    baseline-year: "2023"
    block-newly-available: false
    block-limited-availability: true
    # Send results to dashboard
    dashboard-url: ${{ vars.DASHBOARD_URL }}
    dashboard-api-key: ${{ secrets.DASHBOARD_API_KEY }}
```

## Configuration Options

| Input                        | Description                                    | Required | Default               |
| ---------------------------- | ---------------------------------------------- | -------- | --------------------- |
| `github-token`               | GitHub token for API access                    | Yes      | `${{ github.token }}` |
| `baseline-year`              | Target Baseline year (e.g., "2023")            | No       | `'2023'`              |
| `block-newly-available`      | Block PRs with "Newly Available" features      | No       | `false`               |
| `block-limited-availability` | Block PRs with "Limited Availability" features | No       | `true`                |
| `custom-browser-targets`     | Custom browser targets (JSON format)           | No       | -                     |
| `dashboard-url`              | GreenLightCI Dashboard URL for reporting       | No       | -                     |
| `dashboard-api-key`          | API key for dashboard authentication           | No       | -                     |

## Outputs

| Output                | Description                                    |
| --------------------- | ---------------------------------------------- |
| `compatibility-score` | Overall compatibility score (0-100)            |
| `features-detected`   | Number of web features detected                |
| `blocking-issues`     | Number of compatibility issues blocking the PR |

## Custom Browser Targets

You can define custom browser targets for more specific compatibility requirements:

```yaml
- name: Check Baseline Compatibility
  uses: exprays/greenlightci@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    custom-browser-targets: |
      {
        "chrome": "90",
        "firefox": "88",
        "safari": "14",
        "edge": "90"
      }
```

## 📊 Dashboard Integration

Track your compatibility data over time with the GreenLightCI Dashboard.

### Setup Steps

#### 1. Access Dashboard

Visit your GreenLightCI Dashboard instance (e.g., `https://your-dashboard.vercel.app`)

#### 2. Sign In

Click "Sign in with GitHub" and authenticate

#### 3. Generate API Key

1. Go to **Settings** → **API Keys**
2. Click **"New Key"**
3. Enter a descriptive name (e.g., "Production CI", "MyProject Actions")
4. Click **"Generate"**
5. Copy the generated key (format: `glci_...`)

> ⚠️ **Important**: Save your API key securely! It won't be shown again.

#### 4. Add to GitHub Repository

1. Go to your repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Name: `DASHBOARD_API_KEY`
4. Value: Your API key (e.g., `glci_a1b2c3d4...`)
5. Click **"Add secret"**

#### 5. Add Dashboard URL (Optional)

Either:

- **As a variable**: Settings → Variables → New variable → `DASHBOARD_URL`
- **As a secret**: Same location as API key

#### 6. Update Workflow

```yaml
- name: Check Baseline Compatibility
  uses: exprays/greenlightci-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    baseline-year: "2023"
    dashboard-url: ${{ vars.DASHBOARD_URL }} # or secrets.DASHBOARD_URL
    dashboard-api-key: ${{ secrets.DASHBOARD_API_KEY }}
```

### Dashboard Benefits

- 📊 **Trend Tracking** - Visualize compatibility scores over time
- 📈 **Feature Analytics** - See which features are most commonly used
- 🎯 **Issue Monitoring** - Track blocking issues and warnings across all PRs
- 📁 **Project Overview** - Centralized view of all your repositories
- 🔍 **Historical Data** - Compare current state with past scans
- 📉 **Regression Detection** - Get alerted when compatibility degrades

### API Key Management

The dashboard supports **multiple API keys** per user:

- ✅ **One key per environment** (Production, Staging, Development)
- ✅ **One key per project** for better organization
- ✅ **Revoke keys** individually without affecting others
- ✅ **Track usage** with "last used" timestamps
- ✅ **Name keys** descriptively for easy identification

**Managing Keys:**

- **Copy**: Click the 📋 icon to copy the full key
- **Delete**: Click the 🗑️ icon to revoke (with confirmation)
- **View**: See creation date and last used timestamp

## 📸 Example Output

The action posts a detailed comment on your PR with:

### Compatibility Report

```
🚦 Baseline Compatibility Check

Overall Score: 85/100 ✅

📊 Summary
• 12 features detected
• 0 blocking issues
• 2 warnings

⚠️ Warnings (2)
• Container Queries - Newly Available (2024)
  Used in: src/styles.css:45

✅ Compatible Features (10)
• CSS Grid Layout - Widely Available
• Flexbox - Widely Available
• CSS Custom Properties - Widely Available
...
```

### With Dashboard Integration

When dashboard integration is enabled:

- ✅ Scan results are stored in the database
- ✅ Data appears in dashboard UI immediately
- ✅ Trends and charts update automatically
- ✅ Historical comparison available

## 🔧 Advanced Configuration

### Environment-Specific Settings

Use different configurations for different branches:

```yaml
- name: Check Baseline Compatibility
  uses: exprays/greenlightci-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    baseline-year: ${{ github.ref == 'refs/heads/main' && '2023' || '2024' }}
    block-limited-availability: ${{ github.ref == 'refs/heads/main' }}
```

### Matrix Strategy

Test against multiple Baseline years:

```yaml
strategy:
  matrix:
    baseline: ["2023", "2024"]

steps:
  - name: Check Baseline ${{ matrix.baseline }}
    uses: exprays/greenlightci-action@v1
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      baseline-year: ${{ matrix.baseline }}
```

### Conditional Dashboard Reporting

Only send to dashboard from main branch:

```yaml
- name: Check Baseline Compatibility
  uses: exprays/greenlightci-action@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    baseline-year: "2023"
    dashboard-url: ${{ github.ref == 'refs/heads/main' && secrets.DASHBOARD_URL || '' }}
    dashboard-api-key: ${{ github.ref == 'refs/heads/main' && secrets.DASHBOARD_API_KEY || '' }}
```

## � Troubleshooting

### Action Fails with "Unauthorized"

**Problem**: Dashboard returns 401 Unauthorized

**Solutions**:

1. Verify `DASHBOARD_API_KEY` secret exists and is correct
2. Check the key hasn't been deleted in dashboard settings
3. Ensure the key includes the `glci_` prefix
4. Try generating a new API key

### No PR Comment Posted

**Problem**: Action runs but doesn't comment on PR

**Solutions**:

1. Check workflow permissions include `pull-requests: write`
2. Verify `github-token` has sufficient permissions
3. Check action logs for errors

### Dashboard Not Receiving Data

**Problem**: Action succeeds but dashboard doesn't show data

**Solutions**:

1. Verify `dashboard-url` is correct (no trailing slash)
2. Check dashboard is deployed and accessible
3. Confirm API key is active in dashboard settings
4. Review action logs for dashboard submission errors

### Features Not Detected

**Problem**: PR has web features but action reports 0 features

**Solutions**:

1. Ensure changes are in added lines (not just context)
2. Check file types are supported (CSS, JS, HTML, JSX, TSX)
3. Review feature detection patterns in source code
4. Enable debug logging in workflow

## 🔒 Security

- **API Keys**: Never commit API keys to version control
- **GitHub Tokens**: Use the provided `github.token` secret
- **Secrets**: Store all sensitive data in GitHub Secrets
- **Permissions**: Grant minimum required permissions
- **Key Rotation**: Rotate API keys regularly (every 3-6 months)

## 📚 Resources

- **Dashboard Documentation**: See dashboard `README.md` for setup instructions
- **API Key Management**: See dashboard `API_KEY_FEATURE.md` for detailed guide
- **Integration Guide**: See `FINAL_INTEGRATION_PLAN.md` for deployment steps
- **Web Baseline**: https://web.dev/baseline/
- **GitHub Actions**: https://docs.github.com/en/actions

## 🛠️ Development

### Local Setup

```bash
# Clone repository
git clone https://github.com/exprays/greenlightci-action.git
cd greenlightci-action

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Watch mode for development
npm run dev
```

### Project Structure

```
action/
├── src/
│   ├── index.ts        # Main entry point
│   ├── parser.ts       # Feature detection
│   ├── github.ts       # GitHub API interactions
│   └── shared/         # Shared utilities
├── dist/               # Compiled JavaScript
├── tests/              # Test files
├── action.yml          # Action metadata
└── package.json
```

### Building for Distribution

```bash
# Compile TypeScript and bundle
npm run build

# The dist/index.js file is what GitHub Actions runs
# Make sure to commit dist/ after changes
git add dist/
git commit -m "Build distribution"
```

### Testing Changes

1. **Local Testing**: Use [@vercel/ncc](https://github.com/vercel/ncc) to test locally
2. **PR Testing**: Create a test repository and reference your fork
3. **Version Testing**: Tag a release and test with `uses: your-username/action@v1`

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests if applicable
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Submit a pull request

### Contribution Guidelines

- Follow existing code style (TypeScript, ESLint)
- Add tests for new features
- Update README if adding new configuration options
- Keep commits atomic and well-described
- Ensure all tests pass before submitting PR

## 📝 License

MIT License - see LICENSE file for details

## 🙋 Support

- **Issues**: [GitHub Issues](https://github.com/exprays/greenlightci-action/issues)
- **Discussions**: [GitHub Discussions](https://github.com/exprays/greenlightci-action/discussions)
- **Email**: support@greenlightci.com

---

**Made with ❤️ for better web compatibility**

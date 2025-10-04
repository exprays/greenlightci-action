# 🚦 GreenLightCI - GitHub Action

GitHub Action for checking web feature compatibility against Baseline data in your pull requests.

## Features

- 🔍 **Automatic Feature Detection** - Scans PR changes for web features
- 📊 **Compatibility Scoring** - Provides 0-100 compatibility score
- 🚨 **Configurable Blocking** - Block PRs based on feature availability
- 💬 **Rich PR Comments** - Detailed compatibility reports with visual indicators
- 📈 **Dashboard Integration** - Send results to GreenLightCI Dashboard (optional)
- 🎯 **Custom Browser Targets** - Define your own browser support matrix

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

      - name: Check Baseline Compatibility
        uses: exprays/greenlightci@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          baseline-year: '2023'
          block-newly-available: false
          block-limited-availability: true
```

### With Dashboard Integration

```yaml
- name: Check Baseline Compatibility
  uses: exprays/greenlightci@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    baseline-year: '2023'
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

## Dashboard Integration

### Setup

1. Deploy or access a GreenLightCI Dashboard instance
2. Get an API key from the dashboard settings
3. Add secrets to your GitHub repository:
   - `DASHBOARD_API_KEY`: Your dashboard API key
4. Add variables to your GitHub repository:
   - `DASHBOARD_URL`: Your dashboard URL (e.g., `https://dashboard.greenlightci.com`)

### Benefits

- 📊 Track compatibility trends over time
- 📈 Visualize feature adoption across projects
- 🎯 Monitor blocking issues and warnings
- 📁 Project-level analytics and reports

## Example Output

The action posts a detailed comment on your PR with:

- ✅ Overall compatibility score
- 📋 List of detected features with status indicators
- ⚠️ Warnings for newly available features
- ❌ Errors for limited availability features
- 💡 Suggestions for polyfills (when available)

## Development

```bash
cd packages/action
pnpm install
pnpm build      # Build the action
pnpm dev        # Watch mode
pnpm test       # Run tests
```

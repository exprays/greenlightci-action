# Shared Package

Common utilities and types shared across all packages.

## Structure

```
shared/
├── src/
│   ├── types/         # Shared TypeScript types
│   ├── utils/         # Common utilities
│   ├── baseline.ts    # Baseline data helpers
│   └── constants.ts   # Shared constants
└── package.json       # Dependencies
```

## Usage

```typescript
import { BaselineData, CompatibilityStatus } from '@greenlightci/shared';
import { checkFeatureCompatibility } from '@greenlightci/shared/baseline';
```

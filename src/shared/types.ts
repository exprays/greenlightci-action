/**
 * Baseline compatibility status
 */
export enum BaselineStatus {
  /** Feature is widely available across browsers */
  WidelyAvailable = 'widely',
  /** Feature has recently become baseline */
  NewlyAvailable = 'newly',
  /** Feature has limited availability */
  Limited = 'limited',
  /** Feature is not baseline yet */
  NotBaseline = 'not-baseline',
  /** Unknown status */
  Unknown = 'unknown',
}

/**
 * Browser support information
 */
export interface BrowserSupport {
  chrome?: string;
  edge?: string;
  firefox?: string;
  safari?: string;
}

/**
 * Baseline feature data
 */
export interface BaselineFeature {
  /** Feature ID */
  id: string;
  /** Feature name */
  name: string;
  /** Feature description */
  description?: string;
  /** Baseline status */
  status: BaselineStatus;
  /** Baseline year (when it became baseline) */
  baselineYear?: string;
  /** Browser support data */
  support: BrowserSupport;
  /** MDN URL */
  mdnUrl?: string;
  /** Specification URL */
  specUrl?: string;
}

/**
 * Compatibility check result
 */
export interface CompatibilityResult {
  /** Feature that was checked */
  feature: BaselineFeature;
  /** File path where feature was found */
  filePath: string;
  /** Line number */
  line?: number;
  /** Whether this feature should block the PR */
  blocking: boolean;
  /** Severity level */
  severity: 'error' | 'warning' | 'info';
}

/**
 * Overall compatibility report
 */
export interface CompatibilityReport {
  /** All detected features */
  results: CompatibilityResult[];
  /** Overall compatibility score (0-100) */
  score: number;
  /** Number of blocking issues */
  blockingCount: number;
  /** Number of warnings */
  warningCount: number;
  /** Number of info-level items */
  infoCount: number;
  /** Total features detected */
  totalFeatures: number;
}

/**
 * Configuration for baseline checking
 */
export interface BaselineConfig {
  /** Target baseline year */
  targetYear?: string;
  /** Block PRs with newly available features */
  blockNewlyAvailable: boolean;
  /** Block PRs with limited availability features */
  blockLimitedAvailability: boolean;
  /** Custom browser targets */
  customTargets?: BrowserSupport;
}

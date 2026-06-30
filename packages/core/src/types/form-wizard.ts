/**
 * FormWizard composite component types
 */

import type { StepStatus, StepsDirection, StepSize } from './steps'
import type { TigerLocale } from './locale'

/**
 * Form wizard step definition
 */
export interface WizardStep {
  /**
   * Unique step key
   */
  key?: string | number
  /**
   * Step title
   */
  title: string
  /**
   * Step description
   */
  description?: string
  /**
   * Step status (overrides automatic status)
   */
  status?: StepStatus
  /**
   * Step icon (optional)
   */
  icon?: unknown
  /**
   * Whether the step is disabled
   */
  disabled?: boolean
  /**
   * Step content (framework-specific)
   */
  content?: unknown
  /**
   * Field names for step-scoped validation
   */
  fields?: string[]
  /**
   * Condition function that returns true to skip this step
   */
  skipCondition?: () => boolean
  /**
   * Custom data
   */
  [key: string]: unknown
}

/**
 * Form wizard validation result
 */
export type FormWizardValidateResult = boolean | string

/**
 * Form wizard validation callback
 */
export type FormWizardValidator = (
  current: number,
  step: WizardStep,
  steps: WizardStep[]
) => FormWizardValidateResult | Promise<FormWizardValidateResult>

/**
 * Form wizard props
 */
export interface FormWizardProps {
  /**
   * Steps configuration
   */
  steps: WizardStep[]
  /**
   * Current step index (0-based)
   */
  current?: number
  /**
   * Default step index (uncontrolled)
   * @default 0
   */
  defaultCurrent?: number
  /**
   * Whether steps are clickable
   * @default false
   */
  clickable?: boolean
  /**
   * Steps direction
   * @default 'horizontal'
   */
  direction?: StepsDirection
  /**
   * Steps size
   * @default 'default'
   */
  size?: StepSize
  /**
   * Whether to use simple steps style
   * @default false
   */
  simple?: boolean
  /**
   * Whether to show border around the wizard card
   * @default true
   */
  bordered?: boolean
  /**
   * Whether to show steps header
   * @default true
   */
  showSteps?: boolean
  /**
   * Whether to show action buttons
   * @default true
   */
  showActions?: boolean
  /**
   * Previous button text
   */
  prevText?: string
  /**
   * Next button text
   */
  nextText?: string
  /**
   * Finish button text
   */
  finishText?: string
  /**
   * Locale overrides for FormWizard UI text
   */
  locale?: Partial<TigerLocale>
  /**
   * Flat custom-text overrides for single-language use (no i18n needed).
   * Takes precedence over `locale` and global ConfigProvider text.
   */
  labels?: Partial<import('./locale').TigerLocaleFormWizard>
  /**
   * Validation hook before moving to next step
   */
  beforeNext?: FormWizardValidator
  /**
   * Step change callback
   */
  onChange?: (current: number, prev: number) => void
  /**
   * Finish callback
   */
  onFinish?: (current: number, steps: WizardStep[]) => void
  /**
   * Auto-save callback invoked on each step change
   */
  autoSave?: (current: number, step: WizardStep) => void | Promise<void>
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, unknown>
}

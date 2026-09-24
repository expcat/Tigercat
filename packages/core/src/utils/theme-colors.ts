/**
 * Theme color configuration
 * Supports CSS variables for real-time theme switching
 */

import { mixStatusTowardTextClass } from './status-mix'

/**
 * Button color scheme interface
 * Defines all color-related classes for button variants
 */
export interface ButtonColorScheme {
  /**
   * Background color class
   */
  bg: string

  /**
   * Hover background color class
   */
  bgHover: string

  /**
   * Text color class
   */
  text: string

  /**
   * Border color class (optional, for outline variants)
   */
  border?: string

  /**
   * Border hover color class (optional, for outline variants)
   */
  borderHover?: string

  /**
   * Focus ring color class
   */
  focus: string

  /**
   * Disabled state color class
   */
  disabled: string
}

/**
 * Theme colors configuration for all button variants
 */
export interface ThemeColors {
  /**
   * Primary button theme (solid background with primary color)
   */
  primary: ButtonColorScheme

  /**
   * Secondary button theme (solid background with secondary color)
   */
  secondary: ButtonColorScheme

  /**
   * Outline button theme (transparent background with colored border)
   */
  outline: ButtonColorScheme

  /**
   * Ghost button theme (transparent background, no border)
   */
  ghost: ButtonColorScheme

  /**
   * Link button theme (text-only appearance)
   */
  link: ButtonColorScheme
  danger: ButtonColorScheme
  dangerOutline: ButtonColorScheme
  dangerGhost: ButtonColorScheme
  dangerLink: ButtonColorScheme
}

/**
 * Default theme colors using Tailwind CSS classes
 * These can be overridden by providing custom theme configuration
 */
export const defaultThemeColors: ThemeColors = {
  primary: {
    bg: 'bg-[var(--tiger-primary)]',
    bgHover: 'hover:bg-[var(--tiger-primary-hover)]',
    text: 'text-[var(--tiger-primary-foreground)]',
    focus: 'focus-visible:ring-[var(--tiger-focus-ring)]',
    disabled: 'disabled:bg-[var(--tiger-primary-disabled)]'
  },
  secondary: {
    bg: 'bg-[var(--tiger-secondary)]',
    bgHover: 'hover:bg-[var(--tiger-secondary-hover)]',
    text: 'text-[var(--tiger-secondary-foreground)]',
    focus: 'focus-visible:ring-[var(--tiger-focus-ring)]',
    disabled: 'disabled:bg-[var(--tiger-secondary-disabled)]'
  },
  outline: {
    bg: 'bg-transparent',
    bgHover: 'hover:bg-[var(--tiger-outline-bg-hover)]',
    text: 'text-[var(--tiger-primary)]',
    border: 'border-2 border-[var(--tiger-primary)]',
    focus: 'focus-visible:ring-[var(--tiger-focus-ring)]',
    disabled:
      'disabled:border-[var(--tiger-primary-disabled)] disabled:text-[var(--tiger-primary-disabled)]'
  },
  ghost: {
    bg: 'bg-transparent',
    bgHover: 'hover:bg-[var(--tiger-ghost-bg-hover)]',
    text: 'text-[var(--tiger-primary)]',
    focus: 'focus-visible:ring-[var(--tiger-focus-ring)]',
    disabled: 'disabled:text-[var(--tiger-primary-disabled)]'
  },
  link: {
    bg: 'bg-transparent',
    bgHover: 'hover:underline',
    text: 'text-[var(--tiger-primary)]',
    focus: 'focus-visible:ring-[var(--tiger-focus-ring)]',
    disabled: 'disabled:text-[var(--tiger-primary-disabled)]'
  },
  danger: {
    bg: 'bg-[var(--tiger-error)]',
    bgHover: 'hover:bg-[var(--tiger-error-hover)]',
    text: 'text-[var(--tiger-error-foreground)]',
    focus: 'focus-visible:ring-[var(--tiger-error)]',
    disabled: 'disabled:bg-[var(--tiger-error-disabled)]'
  },
  dangerOutline: {
    bg: 'bg-transparent',
    bgHover: 'hover:bg-[var(--tiger-error-bg-hover)]',
    text: 'text-[var(--tiger-error)]',
    border: 'border-2 border-[var(--tiger-error)]',
    focus: 'focus-visible:ring-[var(--tiger-error)]',
    disabled:
      'disabled:border-[var(--tiger-error-disabled)] disabled:text-[var(--tiger-error-disabled)]'
  },
  dangerGhost: {
    bg: 'bg-transparent',
    bgHover: 'hover:bg-[var(--tiger-error-bg-hover)]',
    text: 'text-[var(--tiger-error)]',
    focus: 'focus-visible:ring-[var(--tiger-error)]',
    disabled: 'disabled:text-[var(--tiger-error-disabled)]'
  },
  dangerLink: {
    bg: 'bg-transparent',
    bgHover: 'hover:underline',
    text: 'text-[var(--tiger-error)]',
    focus: 'focus-visible:ring-[var(--tiger-error)]',
    disabled: 'disabled:text-[var(--tiger-error-disabled)]'
  }
}

/**
 * Get button variant classes based on theme colors.
 * Unknown variants fall back to primary (does not throw). `scheme.focus` is part
 * of the same recipe as the color classes.
 */
export function getButtonVariantClasses(
  variant?: string,
  colors: ThemeColors = defaultThemeColors
): string {
  const scheme =
    variant && variant in colors ? colors[variant as keyof ThemeColors] : colors.primary
  const classes = [
    scheme.bg,
    scheme.bgHover,
    scheme.text,
    scheme.border,
    scheme.borderHover,
    scheme.focus,
    scheme.disabled
  ].filter(Boolean)

  return classes.join(' ')
}

/**
 * Radio color scheme interface
 * Defines all color-related classes for radio buttons
 */
export interface RadioColorScheme {
  /**
   * Border color in unchecked state
   */
  border: string

  /**
   * Border color in checked state
   */
  borderChecked: string

  /**
   * Background color in unchecked state
   */
  bg: string

  /**
   * Background color in checked state
   */
  bgChecked: string

  /**
   * Inner dot color in checked state
   */
  innerDot: string

  /**
   * Disabled state styles
   */
  disabled: string

  /**
   * Text color when disabled
   */
  textDisabled: string
}

/**
 * Default radio color scheme using Tailwind CSS classes
 */
export const defaultRadioColors: RadioColorScheme = {
  border: 'border-[var(--tiger-border)]',
  borderChecked: 'border-[var(--tiger-primary)]',
  bg: 'bg-[var(--tiger-surface)]',
  bgChecked: 'bg-[var(--tiger-primary)]',
  innerDot: 'bg-[var(--tiger-surface)]',
  disabled: 'bg-[var(--tiger-surface-muted)] border-[var(--tiger-border)]',
  textDisabled: 'text-[var(--tiger-text-disabled)]'
}

/**
 * Link color scheme interface
 * Defines all color-related classes for link variants
 */
export interface LinkColorScheme {
  /**
   * Text color in normal state
   */
  text: string

  /**
   * Text color on hover
   */
  textHover: string

  /**
   * Focus ring color
   */
  focus: string

  /**
   * Disabled state text color
   */
  disabled: string
}

/**
 * Link theme colors configuration for all variants
 */
export interface LinkThemeColors {
  /**
   * Primary link theme (uses primary color)
   */
  primary: LinkColorScheme

  /**
   * Secondary link theme (uses secondary color)
   */
  secondary: LinkColorScheme

  /**
   * Default link theme (uses semantic text tokens)
   */
  default: LinkColorScheme
}

/**
 * Default link theme colors using Tailwind CSS classes
 */
export const defaultLinkThemeColors: LinkThemeColors = {
  primary: {
    text: 'text-[var(--tiger-primary)]',
    textHover: 'hover:text-[var(--tiger-primary-hover)]',
    focus: 'focus:ring-[var(--tiger-primary)]',
    disabled: 'text-[var(--tiger-primary-disabled)]'
  },
  secondary: {
    text: 'text-[var(--tiger-secondary)]',
    textHover: 'hover:text-[var(--tiger-secondary-hover)]',
    focus: 'focus:ring-[var(--tiger-secondary)]',
    disabled: 'text-[var(--tiger-secondary-disabled)]'
  },
  default: {
    text: 'text-[var(--tiger-text)]',
    textHover: 'hover:text-[var(--tiger-text-secondary)]',
    focus: 'focus:ring-[var(--tiger-focus-ring)]',
    disabled: 'text-[var(--tiger-text-disabled)]'
  }
}

/**
 * Get link variant classes based on theme colors
 *
 * Notes:
 * - `scheme.focus` is not included because `linkBaseClasses` already provides
 *   `focus-visible:ring-*` with proper CSS variable fallback.
 * - `disabled:` pseudo-class is omitted because it has no effect on `<a>` elements;
 *   disabled styling is applied directly when `options.disabled` is true.
 */
export function getLinkVariantClasses(
  variant?: string,
  colors?: LinkThemeColors,
  options?: { disabled?: boolean }
): string {
  const palette = colors ?? defaultLinkThemeColors
  const resolved = variant && variant in palette ? (variant as keyof LinkThemeColors) : 'primary'
  const scheme = palette[resolved]
  if (options?.disabled) return scheme.disabled
  return `${scheme.text} ${scheme.textHover}`
}

/**
 * Text size classes mapping
 */
export const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl'
} as const

/**
 * Text weight classes mapping
 */
export const textWeightClasses = {
  thin: 'font-thin',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black'
} as const

/**
 * Text alignment classes mapping
 */
export const textAlignClasses = {
  start: 'text-start',
  center: 'text-center',
  end: 'text-end',
  justify: 'text-justify'
} as const

/**
 * Text color classes mapping
 */
export const textColorClasses = {
  default: 'text-[var(--tiger-text)]',
  primary: 'text-[var(--tiger-primary)]',
  secondary: 'text-[var(--tiger-secondary)]',
  success: 'text-[var(--tiger-success)]',
  warning: 'text-[var(--tiger-warning)]',
  danger: 'text-[var(--tiger-error)]',
  muted: 'text-[var(--tiger-text-secondary)]'
} as const

/**
 * Text decoration classes mapping
 */
export const textDecorationClasses = {
  truncate: 'truncate',
  italic: 'italic',
  underline: 'underline',
  lineThrough: 'line-through'
} as const

/**
 * Tag color scheme interface
 * Defines all color-related classes for tag variants
 */
export interface TagColorScheme {
  /**
   * Background color class
   */
  bg: string

  /**
   * Text color class
   */
  text: string

  /**
   * Border color class (optional)
   */
  border?: string

  /**
   * Close button hover background color class
   */
  closeBgHover: string
}

/**
 * Tag theme colors configuration for all variants
 */
export interface TagThemeColors {
  /**
   * Default tag theme (gray background)
   */
  default: TagColorScheme

  /**
   * Primary tag theme (blue background)
   */
  primary: TagColorScheme

  /**
   * Success tag theme (green background)
   */
  success: TagColorScheme

  /**
   * Warning tag theme (yellow background)
   */
  warning: TagColorScheme

  /**
   * Danger tag theme (red background)
   */
  danger: TagColorScheme

  /**
   * Info tag theme (light blue background)
   */
  info: TagColorScheme
}

/**
 * Default tag theme colors using Tailwind CSS classes
 */
export const defaultTagThemeColors: TagThemeColors = {
  default: {
    bg: 'bg-[var(--tiger-surface-muted)]',
    text: 'text-[var(--tiger-text)]',
    border: 'border-[var(--tiger-border)]',
    closeBgHover: 'hover:bg-[var(--tiger-border)]'
  },
  primary: {
    bg: 'bg-[var(--tiger-outline-bg-hover)]',
    text: mixStatusTowardTextClass('text', '--tiger-primary', '#2563eb'),
    border: 'border-[var(--tiger-primary-disabled)]',
    closeBgHover: 'hover:bg-[var(--tiger-primary-disabled)]'
  },
  success: {
    bg: 'bg-[var(--tiger-surface-muted)]',
    text: mixStatusTowardTextClass('text', '--tiger-success', '#16a34a'),
    border: 'border-[var(--tiger-border)]',
    closeBgHover: 'hover:bg-[var(--tiger-border)]'
  },
  warning: {
    bg: 'bg-[var(--tiger-surface-muted)]',
    text: mixStatusTowardTextClass('text', '--tiger-warning', '#d97706'),
    border: 'border-[var(--tiger-border)]',
    closeBgHover: 'hover:bg-[var(--tiger-border)]'
  },
  danger: {
    bg: 'bg-[var(--tiger-error-bg-hover)]',
    text: mixStatusTowardTextClass('text', '--tiger-error', '#dc2626'),
    border: 'border-[var(--tiger-error-disabled)]',
    closeBgHover: 'hover:bg-[var(--tiger-error-disabled)]'
  },
  info: {
    bg: 'bg-[var(--tiger-outline-bg-hover)]',
    text: mixStatusTowardTextClass('text', '--tiger-info', '#3b82f6'),
    border: 'border-[var(--tiger-primary-disabled)]',
    closeBgHover: 'hover:bg-[var(--tiger-primary-disabled)]'
  }
}

/**
 * Get tag variant classes based on theme colors
 * @param variant - Tag variant type
 * @param colors - Tag theme colors configuration (uses default if not provided)
 * @returns Combined class string for the tag variant
 */
export function getTagVariantClasses(
  variant: keyof TagThemeColors,
  colors: TagThemeColors = defaultTagThemeColors
): string {
  const scheme = colors[variant]
  const classes = [scheme.bg, scheme.text, scheme.border].filter(Boolean)

  return classes.join(' ')
}

/**
 * Badge color scheme interface
 */
export interface BadgeColorScheme {
  /** Background color class */
  bg: string
  /** Text color class */
  text: string
}

/**
 * Badge theme colors configuration for all variants
 */
export interface BadgeThemeColors {
  default: BadgeColorScheme
  primary: BadgeColorScheme
  success: BadgeColorScheme
  warning: BadgeColorScheme
  danger: BadgeColorScheme
  info: BadgeColorScheme
}

/**
 * Default badge theme colors using Tailwind CSS classes
 */
export const defaultBadgeThemeColors: BadgeThemeColors = {
  default: {
    bg: mixStatusTowardTextClass('bg', '--tiger-text-secondary', '#6b7280'),
    text: 'text-[var(--tiger-secondary-foreground)]'
  },
  primary: {
    bg: 'bg-[var(--tiger-primary)]',
    text: 'text-[var(--tiger-primary-foreground)]'
  },
  success: {
    bg: mixStatusTowardTextClass('bg', '--tiger-success', '#16a34a'),
    text: 'text-[var(--tiger-primary-foreground)]'
  },
  warning: {
    bg: mixStatusTowardTextClass('bg', '--tiger-warning', '#d97706'),
    text: 'text-[var(--tiger-primary-foreground)]'
  },
  danger: {
    bg: mixStatusTowardTextClass('bg', '--tiger-error', '#dc2626'),
    text: 'text-[var(--tiger-error-foreground)]'
  },
  info: {
    bg: mixStatusTowardTextClass('bg', '--tiger-info', '#3b82f6'),
    text: 'text-[var(--tiger-primary-foreground)]'
  }
}

/**
 * Get badge variant classes based on theme colors
 */
export function getBadgeVariantClasses(
  variant: keyof BadgeThemeColors,
  colors: BadgeThemeColors = defaultBadgeThemeColors
): string {
  const scheme = colors[variant]
  return `${scheme.bg} ${scheme.text}`
}

/**
 * Progress color scheme interface
 * Defines all color-related classes for progress bars
 */
export interface ProgressColorScheme {
  /**
   * Progress bar fill color
   */
  bg: string

  /**
   * Text color for percentage display
   */
  text?: string
}

/**
 * Progress theme colors interface
 */
export interface ProgressThemeColors {
  /**
   * Default progress theme (gray)
   */
  default: ProgressColorScheme

  /**
   * Primary progress theme (blue)
   */
  primary: ProgressColorScheme

  /**
   * Success progress theme (green)
   */
  success: ProgressColorScheme

  /**
   * Warning progress theme (yellow)
   */
  warning: ProgressColorScheme

  /**
   * Danger progress theme (red)
   */
  danger: ProgressColorScheme

  /**
   * Info progress theme (light blue)
   */
  info: ProgressColorScheme
}

/**
 * Default progress theme colors
 */
export const defaultProgressThemeColors: ProgressThemeColors = {
  default: {
    bg: 'bg-[color:var(--tiger-text-secondary)]',
    text: 'text-[color:var(--tiger-text)]'
  },
  primary: {
    bg: 'bg-[color:var(--tiger-primary)]',
    text: 'text-[color:var(--tiger-primary)]'
  },
  success: {
    bg: 'bg-[color:var(--tiger-success)]',
    text: 'text-[color:var(--tiger-success)]'
  },
  warning: {
    bg: 'bg-[color:var(--tiger-warning)]',
    text: 'text-[color:var(--tiger-warning)]'
  },
  danger: {
    bg: 'bg-[color:var(--tiger-error)]',
    text: 'text-[color:var(--tiger-error)]'
  },
  info: {
    bg: 'bg-[color:var(--tiger-info)]',
    text: 'text-[color:var(--tiger-info)]'
  }
}

/**
 * Get progress variant classes based on theme colors
 * @param variant - Progress variant type
 * @param colors - Progress theme colors configuration (uses default if not provided)
 * @returns Combined class string for the progress variant
 */
export function getProgressVariantClasses(
  variant: keyof ProgressThemeColors,
  colors: ProgressThemeColors = defaultProgressThemeColors
): string {
  const scheme = colors[variant]
  return scheme.bg
}

/**
 * Get progress text color classes based on theme colors
 * @param variant - Progress variant type
 * @param colors - Progress theme colors configuration (uses default if not provided)
 * @returns Text color class string
 */
export function getProgressTextColorClasses(
  variant: keyof ProgressThemeColors,
  colors: ProgressThemeColors = defaultProgressThemeColors
): string {
  const scheme = colors[variant]
  return scheme.text || 'text-[var(--tiger-text)]'
}

/**
 * Alert color scheme interface
 * Defines all color-related classes for alert types
 */
export interface AlertColorScheme {
  /**
   * Background color class
   */
  bg: string

  /**
   * Border color class
   */
  border: string

  /**
   * Icon color class
   */
  icon: string

  /**
   * Title text color class
   */
  title: string

  /**
   * Description text color class
   */
  description: string

  /**
   * Close button color class
   */
  closeButton: string

  /**
   * Close button hover background color class
   */
  closeButtonHover: string

  /**
   * Focus ring color class
   */
  focus: string
}

/**
 * Alert theme colors interface
 */
export interface AlertThemeColors {
  /**
   * Success alert theme (green)
   */
  success: AlertColorScheme

  /**
   * Warning alert theme (yellow)
   */
  warning: AlertColorScheme

  /**
   * Error alert theme (red)
   */
  error: AlertColorScheme

  /**
   * Info alert theme (blue)
   */
  info: AlertColorScheme
}

/**
 * Default alert theme colors using Tailwind CSS classes
 */
export const defaultAlertThemeColors: AlertThemeColors = {
  success: {
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    icon: 'text-[var(--tiger-success)]',
    title: 'text-[var(--tiger-success)]',
    description: 'text-[var(--tiger-text-secondary)]',
    closeButton: 'text-[var(--tiger-success)]',
    closeButtonHover: 'hover:bg-[var(--tiger-surface-muted)]',
    focus: 'focus:ring-[color:var(--tiger-success)]'
  },
  warning: {
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    icon: 'text-[var(--tiger-warning)]',
    title: 'text-[var(--tiger-warning)]',
    description: 'text-[var(--tiger-text-secondary)]',
    closeButton: 'text-[var(--tiger-warning)]',
    closeButtonHover: 'hover:bg-[var(--tiger-surface-muted)]',
    focus: 'focus:ring-[color:var(--tiger-warning)]'
  },
  error: {
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    icon: 'text-[var(--tiger-error)]',
    title: 'text-[var(--tiger-error)]',
    description: 'text-[var(--tiger-text-secondary)]',
    closeButton: 'text-[var(--tiger-error)]',
    closeButtonHover: 'hover:bg-[var(--tiger-surface-muted)]',
    focus: 'focus:ring-[color:var(--tiger-error)]'
  },
  info: {
    bg: 'bg-[var(--tiger-surface)]',
    border: 'border-[var(--tiger-border)]',
    icon: 'text-[var(--tiger-info)]',
    title: 'text-[var(--tiger-info)]',
    description: 'text-[var(--tiger-text-secondary)]',
    closeButton: 'text-[var(--tiger-info)]',
    closeButtonHover: 'hover:bg-[var(--tiger-surface-muted)]',
    focus: 'focus:ring-[color:var(--tiger-info)]'
  }
}

/**
 * Get alert type classes based on theme colors
 * @param type - Alert type
 * @param colors - Alert theme colors configuration (uses default if not provided)
 * @returns Alert color scheme object
 */
export function getAlertTypeClasses(
  type: 'success' | 'warning' | 'error' | 'info',
  colors: AlertThemeColors = defaultAlertThemeColors
): AlertColorScheme {
  return colors[type]
}

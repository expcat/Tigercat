/**
 * Theme color configuration
 * Supports CSS variables for real-time theme switching
 */

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
}

/**
 * Default theme colors using Tailwind CSS classes
 * These can be overridden by providing custom theme configuration
 */
export const defaultThemeColors: ThemeColors = {
  primary: {
    bg: 'bg-[var(--tiger-primary,#2563eb)]',
    bgHover: 'hover:bg-[var(--tiger-primary-hover,#1d4ed8)]',
    text: 'text-white',
    focus: 'focus:ring-[var(--tiger-primary,#2563eb)]',
    disabled: 'disabled:bg-[var(--tiger-primary-disabled,#93c5fd)]',
  },
  secondary: {
    bg: 'bg-[var(--tiger-secondary,#4b5563)]',
    bgHover: 'hover:bg-[var(--tiger-secondary-hover,#374151)]',
    text: 'text-white',
    focus: 'focus:ring-[var(--tiger-secondary,#4b5563)]',
    disabled: 'disabled:bg-[var(--tiger-secondary-disabled,#9ca3af)]',
  },
  outline: {
    bg: 'bg-transparent',
    bgHover: 'hover:bg-[var(--tiger-outline-bg-hover,#eff6ff)]',
    text: 'text-[var(--tiger-primary,#2563eb)]',
    border: 'border-2 border-[var(--tiger-primary,#2563eb)]',
    focus: 'focus:ring-[var(--tiger-primary,#2563eb)]',
    disabled: 'disabled:border-[var(--tiger-primary-disabled,#93c5fd)] disabled:text-[var(--tiger-primary-disabled,#93c5fd)]',
  },
  ghost: {
    bg: 'bg-transparent',
    bgHover: 'hover:bg-[var(--tiger-ghost-bg-hover,#eff6ff)]',
    text: 'text-[var(--tiger-primary,#2563eb)]',
    focus: 'focus:ring-[var(--tiger-primary,#2563eb)]',
    disabled: 'disabled:text-[var(--tiger-primary-disabled,#93c5fd)]',
  },
  link: {
    bg: 'bg-transparent',
    bgHover: 'hover:underline',
    text: 'text-[var(--tiger-primary,#2563eb)]',
    focus: 'focus:ring-[var(--tiger-primary,#2563eb)]',
    disabled: 'disabled:text-[var(--tiger-primary-disabled,#93c5fd)]',
  },
}

/**
 * Get button variant classes based on theme colors
 * @param variant - Button variant type
 * @param colors - Theme colors configuration (uses default if not provided)
 * @returns Combined class string for the button variant
 */
export function getButtonVariantClasses(
  variant: keyof ThemeColors,
  colors: ThemeColors = defaultThemeColors
): string {
  const scheme = colors[variant]
  const classes = [
    scheme.bg,
    scheme.bgHover,
    scheme.text,
    scheme.border,
    scheme.borderHover,
    scheme.focus,
    scheme.disabled,
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
   * Focus ring color
   */
  focus: string
  
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
  border: 'border-gray-300',
  borderChecked: 'border-[var(--tiger-primary,#2563eb)]',
  bg: 'bg-white',
  bgChecked: 'bg-[var(--tiger-primary,#2563eb)]',
  innerDot: 'bg-white',
  focus: 'focus:ring-[var(--tiger-primary,#2563eb)]',
  disabled: 'disabled:bg-gray-100 disabled:border-gray-200',
  textDisabled: 'text-gray-400',
}

/**
 * Get radio color classes
 * @param colors - Radio color scheme (uses default if not provided)
 * @returns Radio color scheme with all class strings
 */
export function getRadioColorClasses(
  colors: RadioColorScheme = defaultRadioColors
): RadioColorScheme {
  return colors
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
   * Default link theme (uses gray color)
   */
  default: LinkColorScheme
}

/**
 * Default link theme colors using Tailwind CSS classes
 */
export const defaultLinkThemeColors: LinkThemeColors = {
  primary: {
    text: 'text-[var(--tiger-primary,#2563eb)]',
    textHover: 'hover:text-[var(--tiger-primary-hover,#1d4ed8)]',
    focus: 'focus:ring-[var(--tiger-primary,#2563eb)]',
    disabled: 'text-[var(--tiger-primary-disabled,#93c5fd)]',
  },
  secondary: {
    text: 'text-[var(--tiger-secondary,#4b5563)]',
    textHover: 'hover:text-[var(--tiger-secondary-hover,#374151)]',
    focus: 'focus:ring-[var(--tiger-secondary,#4b5563)]',
    disabled: 'text-[var(--tiger-secondary-disabled,#9ca3af)]',
  },
  default: {
    text: 'text-gray-700',
    textHover: 'hover:text-gray-900',
    focus: 'focus:ring-gray-500',
    disabled: 'text-gray-400',
  },
}

/**
 * Get link variant classes based on theme colors
 */
export function getLinkVariantClasses(
  variant: keyof LinkThemeColors,
  colors: LinkThemeColors = defaultLinkThemeColors
): string {
  const scheme = colors[variant]
  const classes = [
    scheme.text,
    scheme.textHover,
    scheme.focus,
    `disabled:${scheme.disabled}`,
  ].filter(Boolean)
  
  return classes.join(' ')
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
  '6xl': 'text-6xl',
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
  black: 'font-black',
} as const

/**
 * Text alignment classes mapping
 */
export const textAlignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
} as const

/**
 * Text color classes mapping
 */
export const textColorClasses = {
  default: 'text-gray-900',
  primary: 'text-[var(--tiger-primary,#2563eb)]',
  secondary: 'text-[var(--tiger-secondary,#4b5563)]',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  danger: 'text-red-600',
  muted: 'text-gray-500',
} as const

/**
 * Text decoration classes mapping
 */
export const textDecorationClasses = {
  truncate: 'truncate',
  italic: 'italic',
  underline: 'underline',
  lineThrough: 'line-through',
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
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    closeBgHover: 'hover:bg-gray-200',
  },
  primary: {
    bg: 'bg-blue-100',
    text: 'text-[var(--tiger-primary,#2563eb)]',
    border: 'border-blue-200',
    closeBgHover: 'hover:bg-blue-200',
  },
  success: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    closeBgHover: 'hover:bg-green-200',
  },
  warning: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    closeBgHover: 'hover:bg-yellow-200',
  },
  danger: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    closeBgHover: 'hover:bg-red-200',
  },
  info: {
    bg: 'bg-sky-100',
    text: 'text-sky-700',
    border: 'border-sky-200',
    closeBgHover: 'hover:bg-sky-200',
  },
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
  const classes = [
    scheme.bg,
    scheme.text,
    scheme.border,
  ].filter(Boolean)
  
  return classes.join(' ')
}

/**
 * Badge color scheme interface
 * Defines all color-related classes for badge variants
 */
export interface BadgeColorScheme {
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
}

/**
 * Badge theme colors configuration for all variants
 */
export interface BadgeThemeColors {
  /**
   * Default badge theme (gray background)
   */
  default: BadgeColorScheme
  
  /**
   * Primary badge theme (blue background)
   */
  primary: BadgeColorScheme
  
  /**
   * Success badge theme (green background)
   */
  success: BadgeColorScheme
  
  /**
   * Warning badge theme (yellow background)
   */
  warning: BadgeColorScheme
  
  /**
   * Danger badge theme (red background)
   */
  danger: BadgeColorScheme
  
  /**
   * Info badge theme (light blue background)
   */
  info: BadgeColorScheme
}

/**
 * Default badge theme colors using Tailwind CSS classes
 */
export const defaultBadgeThemeColors: BadgeThemeColors = {
  default: {
    bg: 'bg-gray-500',
    text: 'text-white',
    border: 'border-gray-500',
  },
  primary: {
    bg: 'bg-[var(--tiger-primary,#2563eb)]',
    text: 'text-white',
    border: 'border-[var(--tiger-primary,#2563eb)]',
  },
  success: {
    bg: 'bg-green-500',
    text: 'text-white',
    border: 'border-green-500',
  },
  warning: {
    bg: 'bg-yellow-500',
    text: 'text-white',
    border: 'border-yellow-500',
  },
  danger: {
    bg: 'bg-red-500',
    text: 'text-white',
    border: 'border-red-500',
  },
  info: {
    bg: 'bg-sky-500',
    text: 'text-white',
    border: 'border-sky-500',
  },
}

/**
 * Get badge variant classes based on theme colors
 * @param variant - Badge variant type
 * @param colors - Badge theme colors configuration (uses default if not provided)
 * @returns Combined class string for the badge variant
 */
export function getBadgeVariantClasses(
  variant: keyof BadgeThemeColors,
  colors: BadgeThemeColors = defaultBadgeThemeColors
): string {
  const scheme = colors[variant]
  const classes = [
    scheme.bg,
    scheme.text,
    scheme.border,
  ].filter(Boolean)
  
  return classes.join(' ')
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
 * Default progress theme colors using Tailwind CSS classes
 */
export const defaultProgressThemeColors: ProgressThemeColors = {
  default: {
    bg: 'bg-gray-500',
    text: 'text-gray-700',
  },
  primary: {
    bg: 'bg-[var(--tiger-primary,#2563eb)]',
    text: 'text-[var(--tiger-primary,#2563eb)]',
  },
  success: {
    bg: 'bg-green-500',
    text: 'text-green-600',
  },
  warning: {
    bg: 'bg-yellow-500',
    text: 'text-yellow-600',
  },
  danger: {
    bg: 'bg-red-500',
    text: 'text-red-600',
  },
  info: {
    bg: 'bg-sky-500',
    text: 'text-sky-600',
  },
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
  return scheme.text || 'text-gray-700'
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
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-500',
    title: 'text-green-800',
    description: 'text-green-700',
    closeButton: 'text-green-500',
    closeButtonHover: 'hover:bg-green-100',
    focus: 'focus:ring-green-500',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-500',
    title: 'text-yellow-800',
    description: 'text-yellow-700',
    closeButton: 'text-yellow-500',
    closeButtonHover: 'hover:bg-yellow-100',
    focus: 'focus:ring-yellow-500',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-500',
    title: 'text-red-800',
    description: 'text-red-700',
    closeButton: 'text-red-500',
    closeButtonHover: 'hover:bg-red-100',
    focus: 'focus:ring-red-500',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    description: 'text-blue-700',
    closeButton: 'text-blue-500',
    closeButtonHover: 'hover:bg-blue-100',
    focus: 'focus:ring-blue-500',
  },
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

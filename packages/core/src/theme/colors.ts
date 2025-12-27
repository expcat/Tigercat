/**
 * Theme color configuration
 * Supports CSS variables for real-time theme switching
 */

/**
 * Button color scheme interface
 */
export interface ButtonColorScheme {
  bg: string
  bgHover: string
  text: string
  border?: string
  borderHover?: string
  focus: string
  disabled: string
}

/**
 * Theme colors configuration
 */
export interface ThemeColors {
  primary: ButtonColorScheme
  secondary: ButtonColorScheme
  outline: ButtonColorScheme
  ghost: ButtonColorScheme
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
 */
export interface RadioColorScheme {
  border: string
  borderChecked: string
  bg: string
  bgChecked: string
  innerDot: string
  focus: string
  disabled: string
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
 */
export function getRadioColorClasses(
  colors: RadioColorScheme = defaultRadioColors
): RadioColorScheme {
  return colors
}

/**
 * Link color scheme interface
 */
export interface LinkColorScheme {
  text: string
  textHover: string
  focus: string
  disabled: string
}

/**
 * Link theme colors configuration
 */
export interface LinkThemeColors {
  primary: LinkColorScheme
  secondary: LinkColorScheme
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

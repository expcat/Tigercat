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
  bg: string;

  /**
   * Hover background color class
   */
  bgHover: string;

  /**
   * Text color class
   */
  text: string;

  /**
   * Border color class (optional, for outline variants)
   */
  border?: string;

  /**
   * Border hover color class (optional, for outline variants)
   */
  borderHover?: string;

  /**
   * Focus ring color class
   */
  focus: string;

  /**
   * Disabled state color class
   */
  disabled: string;
}

/**
 * Theme colors configuration for all button variants
 */
export interface ThemeColors {
  /**
   * Primary button theme (solid background with primary color)
   */
  primary: ButtonColorScheme;

  /**
   * Secondary button theme (solid background with secondary color)
   */
  secondary: ButtonColorScheme;

  /**
   * Outline button theme (transparent background with colored border)
   */
  outline: ButtonColorScheme;

  /**
   * Ghost button theme (transparent background, no border)
   */
  ghost: ButtonColorScheme;

  /**
   * Link button theme (text-only appearance)
   */
  link: ButtonColorScheme;
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
    disabled:
      'disabled:border-[var(--tiger-primary-disabled,#93c5fd)] disabled:text-[var(--tiger-primary-disabled,#93c5fd)]',
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
};

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
  const scheme = colors[variant];
  const classes = [
    scheme.bg,
    scheme.bgHover,
    scheme.text,
    scheme.border,
    scheme.borderHover,
    scheme.focus,
    scheme.disabled,
  ].filter(Boolean);

  return classes.join(' ');
}

/**
 * Radio color scheme interface
 * Defines all color-related classes for radio buttons
 */
export interface RadioColorScheme {
  /**
   * Border color in unchecked state
   */
  border: string;

  /**
   * Border color in checked state
   */
  borderChecked: string;

  /**
   * Background color in unchecked state
   */
  bg: string;

  /**
   * Background color in checked state
   */
  bgChecked: string;

  /**
   * Inner dot color in checked state
   */
  innerDot: string;

  /**
   * Focus ring color
   */
  focus: string;

  /**
   * Disabled state styles
   */
  disabled: string;

  /**
   * Text color when disabled
   */
  textDisabled: string;
}

/**
 * Default radio color scheme using Tailwind CSS classes
 */
export const defaultRadioColors: RadioColorScheme = {
  border: 'border-[var(--tiger-border,#d1d5db)]',
  borderChecked: 'border-[var(--tiger-primary,#2563eb)]',
  bg: 'bg-[var(--tiger-surface,#ffffff)]',
  bgChecked: 'bg-[var(--tiger-primary,#2563eb)]',
  innerDot: 'bg-[var(--tiger-surface,#ffffff)]',
  focus: 'ring-[var(--tiger-primary,#2563eb)]',
  disabled:
    'bg-[var(--tiger-surface-muted,#f3f4f6)] border-[var(--tiger-border,#d1d5db)]',
  textDisabled: 'text-[var(--tiger-text-muted,#6b7280)]',
};

/**
 * Get radio color classes
 * @param colors - Radio color scheme (uses default if not provided)
 * @returns Radio color scheme with all class strings
 */
export function getRadioColorClasses(
  colors: RadioColorScheme = defaultRadioColors
): RadioColorScheme {
  return colors;
}

/**
 * Link color scheme interface
 * Defines all color-related classes for link variants
 */
export interface LinkColorScheme {
  /**
   * Text color in normal state
   */
  text: string;

  /**
   * Text color on hover
   */
  textHover: string;

  /**
   * Focus ring color
   */
  focus: string;

  /**
   * Disabled state text color
   */
  disabled: string;
}

/**
 * Link theme colors configuration for all variants
 */
export interface LinkThemeColors {
  /**
   * Primary link theme (uses primary color)
   */
  primary: LinkColorScheme;

  /**
   * Secondary link theme (uses secondary color)
   */
  secondary: LinkColorScheme;

  /**
   * Default link theme (uses gray color)
   */
  default: LinkColorScheme;
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
};

/**
 * Get link variant classes based on theme colors
 */
export function getLinkVariantClasses(
  variant: keyof LinkThemeColors,
  colors?: LinkThemeColors,
  options?: { disabled?: boolean }
): string {
  const scheme = (colors ?? defaultLinkThemeColors)[variant];
  const classes = [
    scheme.text,
    scheme.textHover,
    scheme.focus,
    `disabled:${scheme.disabled}`,
    options?.disabled ? scheme.disabled : undefined,
  ].filter(Boolean);

  return classes.join(' ');
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
} as const;

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
} as const;

/**
 * Text alignment classes mapping
 */
export const textAlignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
} as const;

/**
 * Text color classes mapping
 */
export const textColorClasses = {
  default: 'text-[var(--tiger-text,#111827)]',
  primary: 'text-[var(--tiger-primary,#2563eb)]',
  secondary: 'text-[var(--tiger-secondary,#4b5563)]',
  success: 'text-[var(--tiger-success,#16a34a)]',
  warning: 'text-[var(--tiger-warning,#ca8a04)]',
  danger: 'text-[var(--tiger-error,#dc2626)]',
  muted: 'text-[var(--tiger-text-muted,#6b7280)]',
} as const;

/**
 * Text decoration classes mapping
 */
export const textDecorationClasses = {
  truncate: 'truncate',
  italic: 'italic',
  underline: 'underline',
  lineThrough: 'line-through',
} as const;

/**
 * Tag color scheme interface
 * Defines all color-related classes for tag variants
 */
export interface TagColorScheme {
  /**
   * Background color class
   */
  bg: string;

  /**
   * Text color class
   */
  text: string;

  /**
   * Border color class (optional)
   */
  border?: string;

  /**
   * Close button hover background color class
   */
  closeBgHover: string;
}

/**
 * Tag theme colors configuration for all variants
 */
export interface TagThemeColors {
  /**
   * Default tag theme (gray background)
   */
  default: TagColorScheme;

  /**
   * Primary tag theme (blue background)
   */
  primary: TagColorScheme;

  /**
   * Success tag theme (green background)
   */
  success: TagColorScheme;

  /**
   * Warning tag theme (yellow background)
   */
  warning: TagColorScheme;

  /**
   * Danger tag theme (red background)
   */
  danger: TagColorScheme;

  /**
   * Info tag theme (light blue background)
   */
  info: TagColorScheme;
}

/**
 * Default tag theme colors using Tailwind CSS classes
 */
export const defaultTagThemeColors: TagThemeColors = {
  default: {
    bg: 'bg-[var(--tiger-tag-default-bg,#f3f4f6)]',
    text: 'text-[var(--tiger-text,#111827)]',
    border: 'border-[var(--tiger-border,#e5e7eb)]',
    closeBgHover: 'hover:bg-[var(--tiger-tag-default-close-hover,#e5e7eb)]',
  },
  primary: {
    bg: 'bg-[var(--tiger-tag-primary-bg,#dbeafe)]',
    text: 'text-[var(--tiger-primary,#2563eb)]',
    border: 'border-[var(--tiger-tag-primary-border,#bfdbfe)]',
    closeBgHover: 'hover:bg-[var(--tiger-tag-primary-close-hover,#bfdbfe)]',
  },
  success: {
    bg: 'bg-[var(--tiger-tag-success-bg,#dcfce7)]',
    text: 'text-[var(--tiger-success,#16a34a)]',
    border: 'border-[var(--tiger-tag-success-border,#bbf7d0)]',
    closeBgHover: 'hover:bg-[var(--tiger-tag-success-close-hover,#bbf7d0)]',
  },
  warning: {
    bg: 'bg-[var(--tiger-tag-warning-bg,#fef9c3)]',
    text: 'text-[var(--tiger-warning,#ca8a04)]',
    border: 'border-[var(--tiger-tag-warning-border,#fef08a)]',
    closeBgHover: 'hover:bg-[var(--tiger-tag-warning-close-hover,#fef08a)]',
  },
  danger: {
    bg: 'bg-[var(--tiger-tag-danger-bg,#fee2e2)]',
    text: 'text-[var(--tiger-error,#dc2626)]',
    border: 'border-[var(--tiger-tag-danger-border,#fecaca)]',
    closeBgHover: 'hover:bg-[var(--tiger-tag-danger-close-hover,#fecaca)]',
  },
  info: {
    bg: 'bg-[var(--tiger-tag-info-bg,#e0f2fe)]',
    text: 'text-[var(--tiger-info,#3b82f6)]',
    border: 'border-[var(--tiger-tag-info-border,#bae6fd)]',
    closeBgHover: 'hover:bg-[var(--tiger-tag-info-close-hover,#bae6fd)]',
  },
};

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
  const scheme = colors[variant];
  const classes = [scheme.bg, scheme.text, scheme.border].filter(Boolean);

  return classes.join(' ');
}

/**
 * Badge color scheme interface
 * Defines all color-related classes for badge variants
 */
export interface BadgeColorScheme {
  /**
   * Background color class
   */
  bg: string;

  /**
   * Text color class
   */
  text: string;

  /**
   * Border color class (optional)
   */
  border?: string;
}

/**
 * Badge theme colors configuration for all variants
 */
export interface BadgeThemeColors {
  /**
   * Default badge theme (gray background)
   */
  default: BadgeColorScheme;

  /**
   * Primary badge theme (blue background)
   */
  primary: BadgeColorScheme;

  /**
   * Success badge theme (green background)
   */
  success: BadgeColorScheme;

  /**
   * Warning badge theme (yellow background)
   */
  warning: BadgeColorScheme;

  /**
   * Danger badge theme (red background)
   */
  danger: BadgeColorScheme;

  /**
   * Info badge theme (light blue background)
   */
  info: BadgeColorScheme;
}

/**
 * Default badge theme colors using Tailwind CSS classes
 */
export const defaultBadgeThemeColors: BadgeThemeColors = {
  default: {
    bg: 'bg-[var(--tiger-text-muted,#6b7280)]',
    text: 'text-white',
    border: 'border-[var(--tiger-text-muted,#6b7280)]',
  },
  primary: {
    bg: 'bg-[var(--tiger-primary,#2563eb)]',
    text: 'text-white',
    border: 'border-[var(--tiger-primary,#2563eb)]',
  },
  success: {
    bg: 'bg-[var(--tiger-success,#16a34a)]',
    text: 'text-white',
    border: 'border-[var(--tiger-success,#16a34a)]',
  },
  warning: {
    bg: 'bg-[var(--tiger-warning,#ca8a04)]',
    text: 'text-white',
    border: 'border-[var(--tiger-warning,#ca8a04)]',
  },
  danger: {
    bg: 'bg-[var(--tiger-error,#dc2626)]',
    text: 'text-white',
    border: 'border-[var(--tiger-error,#dc2626)]',
  },
  info: {
    bg: 'bg-[var(--tiger-info,#3b82f6)]',
    text: 'text-white',
    border: 'border-[var(--tiger-info,#3b82f6)]',
  },
};

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
  const scheme = colors[variant];
  const classes = [scheme.bg, scheme.text, scheme.border].filter(Boolean);

  return classes.join(' ');
}

/**
 * Progress color scheme interface
 * Defines all color-related classes for progress bars
 */
export interface ProgressColorScheme {
  /**
   * Progress bar fill color
   */
  bg: string;

  /**
   * Text color for percentage display
   */
  text?: string;
}

/**
 * Progress theme colors interface
 */
export interface ProgressThemeColors {
  /**
   * Default progress theme (gray)
   */
  default: ProgressColorScheme;

  /**
   * Primary progress theme (blue)
   */
  primary: ProgressColorScheme;

  /**
   * Success progress theme (green)
   */
  success: ProgressColorScheme;

  /**
   * Warning progress theme (yellow)
   */
  warning: ProgressColorScheme;

  /**
   * Danger progress theme (red)
   */
  danger: ProgressColorScheme;

  /**
   * Info progress theme (light blue)
   */
  info: ProgressColorScheme;
}

/**
 * Default progress theme colors
 */
export const defaultProgressThemeColors: ProgressThemeColors = {
  default: {
    bg: 'bg-[var(--tiger-text-muted,#6b7280)]',
    text: 'text-[var(--tiger-text,#374151)]',
  },
  primary: {
    bg: 'bg-[var(--tiger-primary,#2563eb)]',
    text: 'text-[var(--tiger-primary,#2563eb)]',
  },
  success: {
    bg: 'bg-[var(--tiger-success,#16a34a)]',
    text: 'text-[var(--tiger-success,#16a34a)]',
  },
  warning: {
    bg: 'bg-[var(--tiger-warning,#f59e0b)]',
    text: 'text-[var(--tiger-warning,#f59e0b)]',
  },
  danger: {
    bg: 'bg-[var(--tiger-error,#dc2626)]',
    text: 'text-[var(--tiger-error,#dc2626)]',
  },
  info: {
    bg: 'bg-[var(--tiger-info,#0ea5e9)]',
    text: 'text-[var(--tiger-info,#0ea5e9)]',
  },
};

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
  const scheme = colors[variant];
  return scheme.bg;
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
  const scheme = colors[variant];
  return scheme.text || 'text-[var(--tiger-text,#374151)]';
}

/**
 * Alert color scheme interface
 * Defines all color-related classes for alert types
 */
export interface AlertColorScheme {
  /**
   * Background color class
   */
  bg: string;

  /**
   * Border color class
   */
  border: string;

  /**
   * Icon color class
   */
  icon: string;

  /**
   * Title text color class
   */
  title: string;

  /**
   * Description text color class
   */
  description: string;

  /**
   * Close button color class
   */
  closeButton: string;

  /**
   * Close button hover background color class
   */
  closeButtonHover: string;

  /**
   * Focus ring color class
   */
  focus: string;
}

/**
 * Alert theme colors interface
 */
export interface AlertThemeColors {
  /**
   * Success alert theme (green)
   */
  success: AlertColorScheme;

  /**
   * Warning alert theme (yellow)
   */
  warning: AlertColorScheme;

  /**
   * Error alert theme (red)
   */
  error: AlertColorScheme;

  /**
   * Info alert theme (blue)
   */
  info: AlertColorScheme;
}

/**
 * Default alert theme colors using Tailwind CSS classes
 */
export const defaultAlertThemeColors: AlertThemeColors = {
  success: {
    bg: 'bg-[var(--tiger-alert-success-bg,#f0fdf4)]',
    border: 'border-[var(--tiger-alert-success-border,#bbf7d0)]',
    icon: 'text-[var(--tiger-alert-success-icon,#22c55e)]',
    title: 'text-[var(--tiger-alert-success-title,#166534)]',
    description: 'text-[var(--tiger-alert-success-description,#15803d)]',
    closeButton: 'text-[var(--tiger-alert-success-close,#22c55e)]',
    closeButtonHover:
      'hover:bg-[var(--tiger-alert-success-close-hover-bg,#dcfce7)]',
    focus: 'focus:ring-[color:var(--tiger-alert-success-ring,#22c55e)]',
  },
  warning: {
    bg: 'bg-[var(--tiger-alert-warning-bg,#fefce8)]',
    border: 'border-[var(--tiger-alert-warning-border,#fef08a)]',
    icon: 'text-[var(--tiger-alert-warning-icon,#eab308)]',
    title: 'text-[var(--tiger-alert-warning-title,#854d0e)]',
    description: 'text-[var(--tiger-alert-warning-description,#a16207)]',
    closeButton: 'text-[var(--tiger-alert-warning-close,#eab308)]',
    closeButtonHover:
      'hover:bg-[var(--tiger-alert-warning-close-hover-bg,#fef9c3)]',
    focus: 'focus:ring-[color:var(--tiger-alert-warning-ring,#eab308)]',
  },
  error: {
    bg: 'bg-[var(--tiger-alert-error-bg,#fef2f2)]',
    border: 'border-[var(--tiger-alert-error-border,#fecaca)]',
    icon: 'text-[var(--tiger-alert-error-icon,#ef4444)]',
    title: 'text-[var(--tiger-alert-error-title,#991b1b)]',
    description: 'text-[var(--tiger-alert-error-description,#b91c1c)]',
    closeButton: 'text-[var(--tiger-alert-error-close,#ef4444)]',
    closeButtonHover:
      'hover:bg-[var(--tiger-alert-error-close-hover-bg,#fee2e2)]',
    focus: 'focus:ring-[color:var(--tiger-alert-error-ring,#ef4444)]',
  },
  info: {
    bg: 'bg-[var(--tiger-alert-info-bg,#eff6ff)]',
    border: 'border-[var(--tiger-alert-info-border,#bfdbfe)]',
    icon: 'text-[var(--tiger-alert-info-icon,#3b82f6)]',
    title: 'text-[var(--tiger-alert-info-title,#1e40af)]',
    description: 'text-[var(--tiger-alert-info-description,#1d4ed8)]',
    closeButton: 'text-[var(--tiger-alert-info-close,#3b82f6)]',
    closeButtonHover:
      'hover:bg-[var(--tiger-alert-info-close-hover-bg,#dbeafe)]',
    focus: 'focus:ring-[color:var(--tiger-alert-info-ring,#3b82f6)]',
  },
};

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
  return colors[type];
}

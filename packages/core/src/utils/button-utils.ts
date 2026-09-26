import {
  type ButtonHtmlType,
  type ButtonIconPosition,
  type ButtonSize,
  type ButtonVariant
} from '../types/button'
import { classNames, type ClassValue } from './class-names'
import { getJoinedGroupItemClasses } from './joined-group-utils'
import { getButtonVariantClasses } from './theme-colors'

/**
 * Keyboard ring only (`focus-visible`). Radius / transition follow theme tokens.
 * `tiger-motion-aware` stops spin/scale when the plugin reduced-motion rule is on.
 */
export const buttonBaseClasses =
  'tiger-motion-aware inline-flex items-center justify-center whitespace-nowrap font-medium [transition:var(--tiger-transition-base)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring)]/40 active:scale-[0.98] motion-reduce:active:scale-100'

/** Radius for a button that is not inside a group. Groups paint their own corners. */
export const buttonRadiusClasses = 'rounded-[var(--tiger-radius-md)]'

export const buttonSizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
}

/**
 * Icon-only controls. Text padding is wider than it is tall, so a glyph in
 * that box cannot sit in the optical center. `!p-0` wins over the size padding
 * and over a caller `px-*` that is not itself important.
 */
const buttonIconOnlySizeClasses: Record<ButtonSize, string> = {
  xs: 'h-6 w-6 !p-0',
  sm: 'h-8 w-8 !p-0',
  md: 'h-10 w-10 !p-0',
  lg: 'h-12 w-12 !p-0',
  xl: 'h-14 w-14 !p-0'
}

const buttonIconOnlyBlockSizeClasses: Record<ButtonSize, string> = {
  xs: 'h-6 !p-0',
  sm: 'h-8 !p-0',
  md: 'h-10 !p-0',
  lg: 'h-12 !p-0',
  xl: 'h-14 !p-0'
}

export const buttonDisabledClasses =
  'pointer-events-none cursor-not-allowed opacity-60 active:!scale-100'

const dangerKeyFor = (variant?: string) => {
  if (variant === 'outline') return 'dangerOutline'
  if (variant === 'ghost') return 'dangerGhost'
  if (variant === 'link') return 'dangerLink'
  return 'danger'
}

/** Same table as the color schemes. Kept as a lookup for callers that read by variant. */
export const buttonDangerClasses: Record<ButtonVariant, string> = {
  primary: getButtonVariantClasses('danger'),
  secondary: getButtonVariantClasses('danger'),
  outline: getButtonVariantClasses('dangerOutline'),
  ghost: getButtonVariantClasses('dangerGhost'),
  link: getButtonVariantClasses('dangerLink')
}

export interface ResolveButtonClassesInput {
  variant?: string
  danger?: boolean
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
  /** Group or split seam owns the radius. */
  joined?: boolean
  /**
   * No visible label. Square hit target, padding cleared, glyph centered by
   * the button's flex alignment.
   */
  iconOnly?: boolean
  className?: ClassValue
}

/**
 * Resolve all Button skin classes in one place. Unknown `variant` falls back to
 * primary (same as the danger map). Vue/React only bind the returned string.
 */
export function resolveButtonClasses(input: ResolveButtonClassesInput = {}): string {
  const variant = input.variant
  const variantClasses = input.danger
    ? getButtonVariantClasses(dangerKeyFor(variant))
    : getButtonVariantClasses(variant)
  const size = input.size && input.size in buttonSizeClasses ? input.size : 'md'

  return classNames(
    buttonBaseClasses,
    !input.joined && buttonRadiusClasses,
    variantClasses,
    buttonSizeClasses[size],
    input.iconOnly &&
      (input.block ? buttonIconOnlyBlockSizeClasses[size] : buttonIconOnlySizeClasses[size]),
    (input.disabled || input.loading) && buttonDisabledClasses,
    input.block && 'w-full',
    input.className
  )
}

export const buttonSpinnerSizeClasses: Record<ButtonSize, string> = {
  xs: 'h-3 w-3',
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-5 w-5'
}

const BUTTON_HTML_TYPES: ReadonlySet<string> = new Set(['button', 'submit', 'reset'])

export function isButtonHtmlType(value: unknown): value is ButtonHtmlType {
  return typeof value === 'string' && BUTTON_HTML_TYPES.has(value)
}

/** Native button type. Unknown values fall back to `button`. */
export function resolveButtonType(type: unknown): ButtonHtmlType {
  return isButtonHtmlType(type) ? type : 'button'
}

export type ButtonIconPlacement = 'start' | 'end'

export function resolveButtonIconPlacement(position?: ButtonIconPosition): ButtonIconPlacement {
  return position === 'end' ? 'end' : 'start'
}

export function getButtonIconSlotClasses(
  placement: ButtonIconPlacement,
  hasLabel: boolean
): string {
  if (!hasLabel) return 'inline-flex shrink-0 items-center justify-center leading-none'
  return placement === 'end' ? 'ms-2' : 'me-2'
}

export function getButtonSpinnerClasses(size: ButtonSize = 'md'): string {
  return classNames(
    'tiger-motion-aware animate-spin',
    buttonSpinnerSizeClasses[size] ?? buttonSpinnerSizeClasses.md
  )
}

/**
 * ButtonGroup base classes
 * @since 0.5.0
 */
export const buttonGroupBaseClasses = 'inline-flex'

export const buttonGroupVerticalClasses = 'flex-col'

export const buttonGroupHorizontalClasses = 'flex-row'

/**
 * Child-selector classes for a horizontal ButtonGroup. Targets `button` roots
 * so a Tooltip wrapper is not shaved; a lone child keeps all four radii.
 */
export const buttonGroupItemClasses = getJoinedGroupItemClasses({ child: 'button' })

/**
 * Child-selector classes for a vertical ButtonGroup root.
 */
export const buttonGroupItemVerticalClasses = getJoinedGroupItemClasses({
  orientation: 'vertical',
  child: 'button'
})

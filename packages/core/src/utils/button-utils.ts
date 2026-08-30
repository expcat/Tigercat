import {
  type ButtonHtmlType,
  type ButtonIconPosition,
  type ButtonSize,
  type ButtonVariant
} from '../types/button'
import { classNames, type ClassValue } from './class-names'
import { devWarn } from './dev-warn'
import { getJoinedGroupItemClasses } from './joined-group-utils'
import { getButtonVariantClasses } from './theme-colors'

/**
 * Keyboard ring only (`focus-visible`). Radius / transition follow theme tokens.
 * `tiger-motion-aware` stops spin/scale when the plugin reduced-motion rule is on.
 */
export const buttonBaseClasses =
  'tiger-motion-aware inline-flex items-center justify-center whitespace-nowrap font-medium rounded-[var(--tiger-radius-md,0.5rem)] [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40 active:scale-[0.98] motion-reduce:active:scale-100'

export const buttonSizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl'
}

export const buttonDisabledClasses =
  'pointer-events-none cursor-not-allowed opacity-60 active:!scale-100'

const buttonDangerSolidClasses =
  'bg-[var(--tiger-error,#dc2626)] hover:bg-[var(--tiger-error-hover,#b91c1c)] text-[var(--tiger-error-foreground,#ffffff)] focus-visible:ring-[var(--tiger-error,#dc2626)] disabled:bg-[var(--tiger-error-disabled,#fca5a5)]'

/**
 * Danger mode color overrides per variant.
 * Keyboard ring uses `--tiger-error`; mouse click does not paint `focus:ring-*`.
 */
export const buttonDangerClasses: Record<ButtonVariant, string> = {
  primary: buttonDangerSolidClasses,
  secondary: buttonDangerSolidClasses,
  outline:
    'bg-transparent hover:bg-[var(--tiger-error-bg-hover,#fef2f2)] text-[var(--tiger-error,#dc2626)] border-2 border-[var(--tiger-error,#dc2626)] focus-visible:ring-[var(--tiger-error,#dc2626)] disabled:border-[var(--tiger-error-disabled,#fca5a5)] disabled:text-[var(--tiger-error-disabled,#fca5a5)]',
  ghost:
    'bg-transparent hover:bg-[var(--tiger-error-bg-hover,#fef2f2)] text-[var(--tiger-error,#dc2626)] focus-visible:ring-[var(--tiger-error,#dc2626)] disabled:text-[var(--tiger-error-disabled,#fca5a5)]',
  link: 'bg-transparent hover:underline text-[var(--tiger-error,#dc2626)] focus-visible:ring-[var(--tiger-error,#dc2626)] disabled:text-[var(--tiger-error-disabled,#fca5a5)]'
}

export interface ResolveButtonClassesInput {
  variant?: string
  danger?: boolean
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  block?: boolean
  className?: ClassValue
}

/**
 * Resolve all Button skin classes in one place. Unknown `variant` falls back to
 * primary (same as the danger map). Vue/React only bind the returned string.
 */
export function resolveButtonClasses(input: ResolveButtonClassesInput = {}): string {
  const variant = input.variant
  const variantClasses = input.danger
    ? (buttonDangerClasses[variant as ButtonVariant] ?? buttonDangerClasses.primary)
    : getButtonVariantClasses(variant)
  const size = input.size && input.size in buttonSizeClasses ? input.size : 'md'

  return classNames(
    buttonBaseClasses,
    variantClasses,
    buttonSizeClasses[size],
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

/**
 * `htmlType` and native `type` are the same attribute. Conflicting values keep
 * `htmlType` and warn once.
 */
export function resolveButtonHtmlType(htmlType: unknown, nativeType?: unknown): ButtonHtmlType {
  const fromHtml = isButtonHtmlType(htmlType) ? htmlType : undefined
  const fromNative = isButtonHtmlType(nativeType) ? nativeType : undefined
  if (fromHtml && fromNative && fromHtml !== fromNative) {
    devWarn('Button.htmlType', '[Tigercat] Button htmlType and type differ; htmlType wins.')
  }
  return fromHtml ?? fromNative ?? 'button'
}

export type ButtonIconPlacement = 'start' | 'end'

export function resolveButtonIconPlacement(position?: ButtonIconPosition): ButtonIconPlacement {
  return position === 'right' || position === 'end' ? 'end' : 'start'
}

export function getButtonIconSlotClasses(
  placement: ButtonIconPlacement,
  hasLabel: boolean
): string {
  if (!hasLabel) return ''
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

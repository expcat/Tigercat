/**
 * Theme configuration for Switch component
 */

import { classNames, type ClassValue } from './class-names'
import { composeComponentClasses, type ComposableClassInput } from './compose-classes'
import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'

export const switchRootBaseClasses = 'inline-flex items-center gap-2'

export const switchTrackBaseClasses =
  'relative inline-flex items-center rounded-full tiger-motion-aware [transition:var(--tiger-transition-base)] peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--tiger-focus-ring)] peer-focus-visible:ring-offset-[var(--tiger-surface)]'

export const switchSizeClasses: Record<ComponentSize, string> = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
  lg: 'h-7 w-14'
}

export const switchThumbSizeClasses: Record<ComponentSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}

/**
 * Logical inset so a checked thumb sits at the reading end in LTR and RTL.
 * `start-*` is what Tailwind v4 emits; `inset-inline-start-*` is not, and an
 * omitted inset leaves the thumb on the inline start while the track color
 * still changes.
 */
export const switchThumbCheckedInsetClasses: Record<ComponentSize, string> = {
  sm: 'start-[calc(100%-1.125rem)]',
  md: 'start-[calc(100%-1.375rem)]',
  lg: 'start-[calc(100%-1.625rem)]'
}

export function getSwitchRootClasses(disabled: boolean = false, ...classes: ClassValue[]): string {
  return classNames(
    switchRootBaseClasses,
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    ...classes
  )
}

export function getSwitchTrackClasses(
  size: ComponentSize = 'md',
  checked: boolean = false,
  disabled: boolean = false,
  status: InputStatus = 'default'
): string {
  return classNames(
    switchTrackBaseClasses,
    switchSizeClasses[size],
    checked ? 'bg-[var(--tiger-primary)]' : 'bg-[var(--tiger-surface-muted)]',
    disabled && 'opacity-50',
    status === 'error' && !disabled && 'ring-1 ring-[var(--tiger-error)]'
  )
}

/**
 * Get switch container classes based on size and state.
 * Applied to the visual track.
 */
export function getSwitchClasses(
  size: ComponentSize = 'md',
  checked: boolean = false,
  disabled: boolean = false,
  ...classes: ComposableClassInput[]
): string {
  return composeComponentClasses(getSwitchTrackClasses(size, checked, disabled), ...classes)
}

export function getSwitchThumbClasses(
  size: ComponentSize = 'md',
  checked: boolean = false
): string {
  return classNames(
    'absolute top-1/2 -translate-y-1/2 inline-block rounded-full bg-[var(--tiger-surface)] shadow-[var(--tiger-shadow-sm)] tiger-motion-aware [transition:var(--tiger-transition-base)]',
    switchThumbSizeClasses[size],
    checked ? switchThumbCheckedInsetClasses[size] : 'start-0.5'
  )
}

export const switchThumbTranslateClasses = switchThumbCheckedInsetClasses

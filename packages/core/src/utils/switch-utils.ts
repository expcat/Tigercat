/**
 * Theme configuration for Switch component
 */

import { classNames } from './class-names'
import { composeComponentClasses, type ComposableClassInput } from './compose-classes'
import type { ComponentSize } from '../types/base'
import type { InputStatus } from '../types/input'

export const switchRootBaseClasses = 'inline-flex items-center gap-2'

export const switchTrackBaseClasses =
  'relative inline-flex items-center rounded-full tiger-motion-aware [transition:var(--tiger-transition-base,background-color_150ms_ease)] peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))] peer-focus-visible:ring-offset-[var(--tiger-surface,#ffffff)]'

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

/** Logical inset so a checked thumb sits at the reading end in LTR and RTL. */
export const switchThumbCheckedInsetClasses: Record<ComponentSize, string> = {
  sm: 'inset-inline-start-[calc(100%-1.125rem)]',
  md: 'inset-inline-start-[calc(100%-1.375rem)]',
  lg: 'inset-inline-start-[calc(100%-1.625rem)]'
}

export function getSwitchRootClasses(
  disabled: boolean = false,
  ...classes: ComposableClassInput[]
): string {
  return composeComponentClasses(
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
    checked ? 'bg-[var(--tiger-primary,#2563eb)]' : 'bg-[var(--tiger-surface-muted,#e5e7eb)]',
    disabled && 'opacity-50',
    status === 'error' && !disabled && 'ring-1 ring-[var(--tiger-error,#dc2626)]'
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
    'absolute top-1/2 -translate-y-1/2 inline-block rounded-full bg-[var(--tiger-surface,#ffffff)] shadow-[var(--tiger-shadow-sm,0_1px_2px_rgb(0_0_0_/_0.1))] tiger-motion-aware [transition:var(--tiger-transition-base,inset-inline-start_150ms_ease)]',
    switchThumbSizeClasses[size],
    checked ? switchThumbCheckedInsetClasses[size] : 'inset-inline-start-0.5'
  )
}

export const switchThumbTranslateClasses = switchThumbCheckedInsetClasses

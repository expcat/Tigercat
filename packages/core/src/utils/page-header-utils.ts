/**
 * PageHeader utility functions
 *
 * Pure layout class builders and visibility helpers shared by the Vue and
 * React PageHeader implementations. Helpers are string/boolean only so they
 * stay safe to evaluate during server-side rendering.
 */

import { classNames } from './class-names'
import {
  PAGE_HEADER_DEFAULT_BACK_ARIA_LABEL,
  type PageHeaderBackVisibilityInput,
  type PageHeaderHeadingContentFlags
} from '../types/page-header'

/** Root page-header landmark */
export const pageHeaderRootClasses =
  'tiger-page-header flex w-full flex-col gap-3 border-b border-[var(--tiger-border,#e5e7eb)] pb-4'

/** Heading row: left cluster (back + title/crumb) and right actions */
export const pageHeaderHeadingRowClasses =
  'tiger-page-header-heading flex w-full items-start justify-between gap-4'

/** Left cluster wrapping the back control and the main column */
export const pageHeaderStartClasses = 'tiger-page-header-start flex min-w-0 items-start gap-2'

/** Title / breadcrumb column */
export const pageHeaderMainClasses = 'tiger-page-header-main flex min-w-0 flex-1 flex-col gap-1'

/** Title + subtitle row */
export const pageHeaderTitleRowClasses =
  'tiger-page-header-title-row flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1'

/** Primary title text */
export const pageHeaderTitleClasses =
  'tiger-page-header-title text-xl font-semibold leading-7 text-[var(--tiger-text,#111827)]'

/** Secondary subtitle text */
export const pageHeaderSubtitleClasses =
  'tiger-page-header-subtitle text-sm leading-6 text-[var(--tiger-text-muted,#6b7280)]'

/** Right-aligned actions */
export const pageHeaderActionsClasses =
  'tiger-page-header-actions ml-auto flex shrink-0 flex-wrap items-center justify-end gap-2'

/** Back control wrapper */
export const pageHeaderBackWrapClasses = 'tiger-page-header-back flex shrink-0 items-center pt-0.5'

/** Compact override applied to the default Button / Link back control */
export const pageHeaderBackButtonClasses = 'h-8 w-8 shrink-0 !px-0'

/** Default back chevron. Flips in RTL so it still points “back”. */
export const pageHeaderBackIconClasses = 'h-5 w-5 rtl:-scale-x-100'

/** Optional body content below the heading row */
export const pageHeaderContentClasses = 'tiger-page-header-content min-w-0'

/**
 * Resolve whether the back control should render.
 *
 * `showBack: false` always hides it. `showBack: true` always shows it.
 * When omitted, a handler, href, or custom override is enough to show it.
 */
export function resolvePageHeaderBackVisibility(input: PageHeaderBackVisibilityInput): boolean {
  if (input.showBack === false) return false
  if (input.showBack === true) return true
  return Boolean(input.hasHandler) || Boolean(input.hasBackHref) || Boolean(input.hasBackOverride)
}

/**
 * Resolve the accessible name for the default back control.
 */
export function resolvePageHeaderBackAriaLabel(label?: string): string {
  if (typeof label === 'string') {
    const trimmed = label.trim()
    if (trimmed) return trimmed
  }
  return PAGE_HEADER_DEFAULT_BACK_ARIA_LABEL
}

/**
 * True when the heading row has anything to render.
 */
export function hasPageHeaderHeadingContent(flags: PageHeaderHeadingContentFlags): boolean {
  return Boolean(
    flags.showBack || flags.hasBreadcrumb || flags.hasTitle || flags.hasSubtitle || flags.hasActions
  )
}

/**
 * Classes for the root landmark.
 */
export function getPageHeaderRootClasses(className?: string): string {
  return classNames(pageHeaderRootClasses, className)
}

/**
 * Classes for the default back Button / Link.
 */
export function getPageHeaderBackButtonClasses(className?: string): string {
  return classNames(pageHeaderBackButtonClasses, className)
}

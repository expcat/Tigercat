import { classNames } from './class-names'
import { getFocusableElements } from './overlay-utils'

const OVERLAY_LAYER_ATTRIBUTE = 'data-tiger-overlay-layer'
const OVERLAY_HOST_ATTRIBUTE = 'data-tiger-overlay-host'

export type AnchoredOverlayLayout = 'anchored' | 'fullscreen-sm' | 'bottom-sheet-sm'

export function resolveAnchoredOverlayTarget(reference: HTMLElement | null): HTMLElement | null {
  return typeof document === 'undefined'
    ? null
    : (reference
        ?.closest(`[${OVERLAY_LAYER_ATTRIBUTE}]`)
        ?.querySelector<HTMLElement>(`:scope > [${OVERLAY_HOST_ATTRIBUTE}]`) ?? document.body)
}

/** Resolve Tab focus relative to the anchor while keeping it inside the active layer. */
export function getAnchoredOverlayTabTarget(
  reference: HTMLElement | null,
  floating: HTMLElement | null,
  shiftKey = false
): HTMLElement | null {
  if (!reference || !floating) return null

  const layer = reference.closest<HTMLElement>(`[${OVERLAY_LAYER_ATTRIBUTE}]`)
  if (!layer) return null

  const focusables = getFocusableElements(layer).filter((element) => !floating.contains(element))
  if (focusables.length === 0) return null

  const referenceIndex = focusables.findIndex(
    (element) => element === reference || reference.contains(element)
  )
  if (referenceIndex < 0) return shiftKey ? focusables[focusables.length - 1] : focusables[0]

  const nextIndex = shiftKey
    ? (referenceIndex - 1 + focusables.length) % focusables.length
    : (referenceIndex + 1) % focusables.length
  return focusables[nextIndex]
}

export function getAnchoredOverlayLayoutClasses(
  layout: AnchoredOverlayLayout = 'anchored',
  matchReferenceWidth = false
): string {
  const positioned =
    'absolute left-[var(--tiger-overlay-x)] top-[var(--tiger-overlay-y)] max-w-[var(--tiger-overlay-available-width)]! max-h-[var(--tiger-overlay-available-height)]! invisible data-[positioned=true]:visible'

  return classNames(
    positioned,
    matchReferenceWidth &&
      (layout === 'anchored'
        ? 'w-[var(--tiger-overlay-reference-width)]'
        : 'sm:w-[var(--tiger-overlay-reference-width)]'),
    layout === 'fullscreen-sm' &&
      'max-sm:visible max-sm:fixed max-sm:inset-0 max-sm:left-auto max-sm:top-auto max-sm:max-w-none! max-sm:max-h-none!',
    layout === 'bottom-sheet-sm' &&
      'max-sm:visible max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:left-auto max-sm:top-auto max-sm:max-w-none! max-sm:max-h-none!'
  )
}

import { classNames } from './class-names'
import { getFocusableElements } from './overlay-utils'

export const OVERLAY_LAYER_ATTRIBUTE = 'data-tiger-overlay-layer'
export const OVERLAY_HOST_ATTRIBUTE = 'data-tiger-overlay-host'
export const CONFIG_ROOT_ATTRIBUTE = 'data-tiger-config-root'

export type AnchoredOverlayLayout = 'anchored' | 'fullscreen-sm' | 'bottom-sheet-sm'

function resolveOwnerDocument(reference: HTMLElement | null): Document | null {
  return reference?.ownerDocument ?? (typeof document === 'undefined' ? null : document)
}

/**
 * Portal target chain: nearest overlay-host → ConfigProvider root → document.body.
 */
export function resolveAnchoredOverlayTarget(reference: HTMLElement | null): HTMLElement | null {
  const ownerDocument = resolveOwnerDocument(reference)
  if (!ownerDocument) return null

  const overlayHost = reference
    ?.closest(`[${OVERLAY_LAYER_ATTRIBUTE}]`)
    ?.querySelector<HTMLElement>(`:scope > [${OVERLAY_HOST_ATTRIBUTE}]`)
  if (overlayHost) return overlayHost

  const configRoot =
    reference?.closest<HTMLElement>(`[${CONFIG_ROOT_ATTRIBUTE}]`) ??
    ownerDocument.querySelector<HTMLElement>(`[${CONFIG_ROOT_ATTRIBUTE}]`)
  if (configRoot) return configRoot

  return ownerDocument.body
}

/** Copy dir/lang onto a portaled layer so start/end placement matches the trigger. */
export function getOverlayDirLang(target: HTMLElement | null): { dir?: string; lang?: string } {
  if (!target) return {}
  const root = target.ownerDocument.documentElement
  const dirSource = target.closest('[dir]') ?? (root.getAttribute('dir') ? root : null)
  const langSource = target.closest('[lang]') ?? (root.getAttribute('lang') ? root : null)
  const dir = dirSource?.getAttribute('dir') ?? undefined
  const lang = langSource?.getAttribute('lang') ?? undefined
  return {
    ...(dir ? { dir } : {}),
    ...(lang ? { lang } : {})
  }
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

  const floatingFocusables = getFocusableElements(floating)
  const activeElement = floating.ownerDocument.activeElement
  const activeIndex = floatingFocusables.findIndex((element) => element === activeElement)
  if (activeIndex >= 0) {
    const boundaryIndex = shiftKey ? 0 : floatingFocusables.length - 1
    if (activeIndex !== boundaryIndex) return null
  }

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
  // Modal/Drawer roots are pointer-events-none; overlay-host is display:contents,
  // so the portaled layer must opt back in or clicks fall through to dialog content.
  const positioned =
    'pointer-events-auto absolute left-[var(--tiger-overlay-x)] top-[var(--tiger-overlay-y)] max-w-[var(--tiger-overlay-available-width)]! max-h-[var(--tiger-overlay-available-height)]! invisible data-[positioned=true]:visible'

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

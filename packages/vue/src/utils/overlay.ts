import {
  getFocusTrapNavigation,
  getFocusableElements,
  isEventOutside,
  lockBodyScroll,
  setBackgroundInert,
  computeFloatingPosition,
  autoUpdateFloating,
  resolveAnchoredOverlayTarget,
  getAnchoredOverlayTabTarget,
  getAnchoredOverlayLayoutClasses,
  getOverlayDirLang,
  isBrowser,
  OVERLAY_Z_INDEX,
  getTransformOrigin,
  restoreFocus,
  registerEscapeDismiss,
  type AnchoredOverlayLayout,
  type FloatingPlacement,
  type FloatingOptions,
  type FloatingResult,
  type FloatingCleanup
} from '@expcat/tigercat-core'
import {
  h,
  ref,
  computed,
  Teleport,
  watch,
  onBeforeUnmount,
  toValue,
  type MaybeRefOrGetter,
  type Ref,
  type VNodeChild
} from 'vue'

const OVERLAY_LAYER_SELECTOR = '[data-tiger-overlay-layer]'

function resolveOverlayLayer(element: HTMLElement | null): HTMLElement | null {
  return element?.closest<HTMLElement>(OVERLAY_LAYER_SELECTOR) ?? null
}

export interface UseVueClickOutsideOptions {
  enabled: Ref<boolean>
  containerRef?: Ref<HTMLElement | null>
  refs?: Array<Ref<HTMLElement | null> | undefined>
  onOutsideClick: () => void
  defer?: boolean
}

export function useVueClickOutside({
  enabled,
  containerRef,
  refs,
  onOutsideClick,
  defer = false
}: UseVueClickOutsideOptions): () => void {
  if (!isBrowser()) return () => undefined
  let timer: number | undefined

  const handler = (event: MouseEvent) => {
    if (!enabled.value) return
    const elements = refs?.length ? refs.map((ref) => ref?.value) : [containerRef?.value]
    if (!elements.some(Boolean)) return

    if (isEventOutside(event, elements)) {
      onOutsideClick()
    }
  }

  const attach = () => document.addEventListener('click', handler)
  const detach = () => document.removeEventListener('click', handler)

  if (!defer) {
    attach()
    return () => detach()
  }

  timer = window.setTimeout(() => attach(), 0)
  return () => {
    if (timer !== undefined) window.clearTimeout(timer)
    detach()
  }
}

export interface UseVueEscapeKeyOptions {
  enabled: Ref<boolean>
  onEscape: () => void
  layerRef?: Ref<HTMLElement | null>
}

export function useVueEscapeKey({
  enabled,
  onEscape,
  layerRef
}: UseVueEscapeKeyOptions): () => void {
  if (!isBrowser()) return () => undefined
  let removeEntry: (() => void) | undefined
  const stop = watch(
    enabled,
    (isEnabled) => {
      removeEntry?.()
      removeEntry = isEnabled
        ? registerEscapeDismiss(document, onEscape, () => layerRef?.value ?? null)
        : undefined
    },
    { immediate: true, flush: 'sync' }
  )

  return () => {
    stop()
    removeEntry?.()
  }
}

export function useVueBodyScrollLock(enabled: Ref<boolean>): void {
  watch(
    enabled,
    (isEnabled, _prevEnabled, onCleanup) => {
      if (!isEnabled || !isBrowser()) return

      const unlock = lockBodyScroll()
      onCleanup(() => unlock())
    },
    { immediate: true }
  )
}

export function useVueBackgroundInert(
  enabled: Ref<boolean>,
  containerRef: Ref<HTMLElement | null>
): void {
  watch(
    [enabled, containerRef],
    ([isEnabled, container], _prev, onCleanup) => {
      if (!isEnabled || !container || !isBrowser()) return
      const release = setBackgroundInert(container)
      onCleanup(() => release())
    },
    { immediate: true, flush: 'post' }
  )
}

function wrapVueOverlayLayer(children: VNodeChild, target: HTMLElement | null): VNodeChild {
  const dirLang = getOverlayDirLang(target)
  return h('div', { class: 'contents', 'data-tiger-overlay-layer': '', ...dirLang }, [
    children,
    h('div', { class: 'contents', 'data-tiger-overlay-host': '' })
  ])
}

export function renderVueBodyTeleport(children: VNodeChild, disabled = false): VNodeChild {
  if (children == null || typeof children === 'boolean') return children
  const target = isBrowser() ? resolveAnchoredOverlayTarget(null) : null
  const layeredChildren = wrapVueOverlayLayer(children, target)
  if (disabled || !isBrowser()) {
    return layeredChildren
  }
  return h(Teleport as never, { to: target ?? 'body', disabled: !target }, [layeredChildren])
}

export function renderVueOverlayTeleport(
  children: VNodeChild,
  target: HTMLElement | null,
  disabled = false
): VNodeChild {
  if (children == null || typeof children === 'boolean') return children
  const layeredChildren = wrapVueOverlayLayer(children, target)
  if (disabled || !target || !isBrowser()) return layeredChildren
  return h(Teleport as never, { to: target }, [layeredChildren])
}

export interface UseVueFocusTrapOptions {
  enabled: Ref<boolean>
  containerRef: Ref<HTMLElement | null>
  /** Inert the rest of the document while the trap is active. */
  inert?: Ref<boolean> | boolean
}

export function useVueFocusTrap({
  enabled,
  containerRef,
  inert = false
}: UseVueFocusTrapOptions): void {
  let releaseInert: (() => void) | undefined
  let detachTrap: (() => void) | undefined

  const teardown = () => {
    detachTrap?.()
    detachTrap = undefined
    releaseInert?.()
    releaseInert = undefined
  }

  watch(
    enabled,
    (isEnabled) => {
      if (!isEnabled || !isBrowser()) teardown()
    },
    { flush: 'sync' }
  )

  watch(
    [enabled, containerRef, () => toValue(inert)],
    ([isEnabled, container, inertEnabled]) => {
      teardown()
      if (!isEnabled || !container || !isBrowser()) return
      const ownerDocument = container.ownerDocument
      releaseInert = inertEnabled ? setBackgroundInert(container) : undefined

      const handler = (event: KeyboardEvent) => {
        const focusables = getFocusableElements(container)
        const activeElement = ownerDocument.activeElement
        const inside = activeElement instanceof Node && container.contains(activeElement)
        if (!inside) {
          if (event.key !== 'Tab') return
          event.preventDefault()
          const next = event.shiftKey ? focusables[focusables.length - 1] : focusables[0]
          next?.focus()
          return
        }
        const navigation = getFocusTrapNavigation(event, focusables, activeElement)
        if (!navigation.shouldHandle) return

        event.preventDefault()
        navigation.next?.focus()
      }

      ownerDocument.addEventListener('keydown', handler, true)
      detachTrap = () => ownerDocument.removeEventListener('keydown', handler, true)
    },
    { immediate: true, flush: 'post' }
  )

  onBeforeUnmount(teardown)
}

// ============================================================================
// Floating UI positioning composable
// ============================================================================

export interface UseVueFloatingOptions {
  /**
   * Reference element (trigger)
   */
  referenceRef: Ref<HTMLElement | null>
  /**
   * Floating element (popup/tooltip)
   */
  floatingRef: Ref<HTMLElement | null>
  /**
   * Whether floating positioning is enabled
   */
  enabled: Ref<boolean>
  /**
   * Preferred placement. Accepts a value, ref, or getter so open overlays
   * follow later placement changes (same as React render-time props).
   * @default 'bottom'
   */
  placement?: MaybeRefOrGetter<FloatingPlacement>
  /**
   * Offset distance in pixels. Accepts a value, ref, or getter.
   * @default 8
   */
  offset?: MaybeRefOrGetter<number>
  /**
   * Arrow element ref
   */
  arrowRef?: MaybeRefOrGetter<HTMLElement | null>
  /**
   * Callback when placement changes (due to collision)
   */
  onPlacementChange?: (placement: FloatingPlacement) => void
}

export interface UseVueFloatingReturn {
  /**
   * X position
   */
  x: Ref<number>
  /**
   * Y position
   */
  y: Ref<number>
  /**
   * Current placement (may differ from requested)
   */
  placement: Ref<FloatingPlacement>
  /**
   * Arrow X position
   */
  arrowX: Ref<number | undefined>
  /**
   * Arrow Y position
   */
  arrowY: Ref<number | undefined>
  /**
   * Manually trigger position update
   */
  update: () => Promise<void>
  isPositioned: Ref<boolean>
  referenceWidth: Ref<number>
}

/**
 * Vue composable for positioning floating elements using Floating UI.
 * Provides automatic position updates on scroll, resize, and layout changes.
 *
 * @example
 * ```ts
 * const referenceRef = ref<HTMLElement | null>(null)
 * const floatingRef = ref<HTMLElement | null>(null)
 * const visible = ref(false)
 *
 * const { x, y, placement } = useVueFloating({
 *   referenceRef,
 *   floatingRef,
 *   enabled: visible,
 *   placement: 'top',
 *   offset: 8
 * })
 *
 * // In template: style="position: absolute; left: `${x}px`; top: `${y}px`"
 * ```
 */
export function useVueFloating(options: UseVueFloatingOptions): UseVueFloatingReturn {
  const { referenceRef, floatingRef, enabled, onPlacementChange } = options

  const requestedPlacement = () => toValue(options.placement) ?? 'bottom'
  const requestedOffset = () => toValue(options.offset) ?? 8
  const requestedArrow = () => toValue(options.arrowRef) ?? null

  const x = ref(0)
  const y = ref(0)
  const placement = ref<FloatingPlacement>(requestedPlacement())
  const arrowX = ref<number | undefined>(undefined)
  const arrowY = ref<number | undefined>(undefined)
  const isPositioned = ref(false)
  const referenceWidth = ref(0)

  let cleanup: FloatingCleanup | null = null
  let updateRequest = 0

  const update = async () => {
    const request = ++updateRequest
    const reference = referenceRef.value
    const floating = floatingRef.value

    if (!enabled.value || !reference || !floating) return

    const floatingOptions: FloatingOptions = {
      placement: requestedPlacement(),
      offset: requestedOffset(),
      flip: true,
      shift: true,
      arrowElement: requestedArrow()
    }

    const result: FloatingResult = await computeFloatingPosition(
      reference,
      floating,
      floatingOptions
    )

    if (
      request !== updateRequest ||
      !enabled.value ||
      referenceRef.value !== reference ||
      floatingRef.value !== floating
    ) {
      return
    }

    referenceWidth.value = reference.getBoundingClientRect().width
    x.value = result.x
    y.value = result.y

    if (result.placement !== placement.value) {
      placement.value = result.placement
      onPlacementChange?.(result.placement)
    }

    if (result.arrow) {
      arrowX.value = result.arrow.x
      arrowY.value = result.arrow.y
    }
    isPositioned.value = true
  }

  watch(
    () =>
      [
        enabled.value,
        referenceRef.value,
        floatingRef.value,
        requestedPlacement(),
        requestedOffset(),
        requestedArrow()
      ] as const,
    ([isEnabled, reference, floating]) => {
      updateRequest += 1
      // Cleanup previous auto-update
      if (cleanup) {
        cleanup()
        cleanup = null
      }

      if (!isEnabled || !reference || !floating || !isBrowser()) {
        isPositioned.value = false
        return
      }

      // Initial position calculation
      update()

      // Set up auto-update
      cleanup = autoUpdateFloating(reference, floating, update)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    updateRequest += 1
    if (cleanup) {
      cleanup()
      cleanup = null
    }
  })

  return {
    x,
    y,
    placement,
    arrowX,
    arrowY,
    update,
    isPositioned,
    referenceWidth
  }
}

export interface UseVueAnchoredOverlayOptions {
  enabled: Ref<boolean>
  referenceRef: Ref<HTMLElement | null>
  floatingRef: Ref<HTMLElement | null>
  containerRef?: Ref<HTMLElement | null>
  outsideRefs?: Array<Ref<HTMLElement | null> | undefined>
  placement?: MaybeRefOrGetter<FloatingPlacement>
  offset?: MaybeRefOrGetter<number>
  layout?: MaybeRefOrGetter<AnchoredOverlayLayout>
  matchReferenceWidth?: MaybeRefOrGetter<boolean>
  portal?: Ref<boolean> | boolean
  dismissOnOutside?: Ref<boolean> | boolean
  dismissOnEscape?: Ref<boolean> | boolean
  restoreFocusOnDismiss?: boolean
  onDismiss?: (reason: AnchoredOverlayDismissReason) => void
}

export type AnchoredOverlayDismissReason = 'outside' | 'escape'

export function useVueAnchoredOverlay(options: UseVueAnchoredOverlayOptions) {
  const floatingLayerRef = computed(
    () => resolveOverlayLayer(options.floatingRef.value) ?? options.floatingRef.value
  )
  const portalEnabled = () =>
    typeof options.portal === 'object' ? options.portal.value : (options.portal ?? true)
  const optionEnabled = (value: Ref<boolean> | boolean | undefined) =>
    typeof value === 'object' ? value.value : Boolean(value)

  const target = computed(() => {
    if (!portalEnabled() || !isBrowser()) return null
    return resolveAnchoredOverlayTarget(options.referenceRef.value)
  })

  watch(
    [options.enabled, options.floatingRef],
    ([enabled, floating], _previous, onCleanup) => {
      if (!enabled || !floating || !isBrowser()) return

      const handleTab = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return
        const target = getAnchoredOverlayTabTarget(
          options.referenceRef.value,
          options.floatingRef.value,
          event.shiftKey
        )
        if (!target) return

        event.preventDefault()
        window.setTimeout(() => restoreFocus(target, { preventScroll: true }), 0)
      }

      floating.addEventListener('keydown', handleTab, true)
      onCleanup(() => floating.removeEventListener('keydown', handleTab, true))
    },
    { immediate: true, flush: 'post' }
  )

  const floating = useVueFloating({
    referenceRef: options.referenceRef,
    floatingRef: options.floatingRef,
    enabled: options.enabled,
    placement: () => toValue(options.placement) ?? 'bottom-start',
    offset: () => toValue(options.offset) ?? 4
  })

  const dismiss = (reason: AnchoredOverlayDismissReason) => {
    options.onDismiss?.(reason)
    if (options.restoreFocusOnDismiss && reason === 'escape') {
      window.setTimeout(() => restoreFocus(options.referenceRef.value, { preventScroll: true }), 0)
    }
  }

  let outsideCleanup: (() => void) | undefined
  let escapeCleanup: (() => void) | undefined
  const dismissSources = [
    options.enabled,
    ...(typeof options.dismissOnOutside === 'object' ? [options.dismissOnOutside] : []),
    ...(typeof options.dismissOnEscape === 'object' ? [options.dismissOnEscape] : [])
  ]
  watch(
    dismissSources,
    ([enabled]) => {
      outsideCleanup?.()
      escapeCleanup?.()
      outsideCleanup = undefined
      escapeCleanup = undefined
      if (!enabled) return
      if (optionEnabled(options.dismissOnOutside)) {
        outsideCleanup = useVueClickOutside({
          enabled: options.enabled,
          refs: [
            options.containerRef,
            options.referenceRef,
            floatingLayerRef,
            ...(options.outsideRefs ?? [])
          ],
          onOutsideClick: () => dismiss('outside'),
          defer: false
        })
      }
      if (optionEnabled(options.dismissOnEscape)) {
        escapeCleanup = useVueEscapeKey({
          enabled: options.enabled,
          onEscape: () => dismiss('escape'),
          layerRef: floatingLayerRef
        })
      }
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    outsideCleanup?.()
    escapeCleanup?.()
  })

  const floatingStyles = computed(() => ({
    '--tiger-overlay-x': `${floating.x.value}px`,
    '--tiger-overlay-y': `${floating.y.value}px`,
    '--tiger-overlay-reference-width': `${floating.referenceWidth.value}px`,
    zIndex: OVERLAY_Z_INDEX.overlay,
    transformOrigin: getTransformOrigin(floating.placement.value)
  }))
  const floatingClasses = computed(() =>
    getAnchoredOverlayLayoutClasses(
      toValue(options.layout) ?? 'anchored',
      toValue(options.matchReferenceWidth) ?? false
    )
  )

  return {
    target,
    floatingStyles,
    floatingClasses,
    positioned: floating.isPositioned,
    placement: floating.placement,
    x: floating.x,
    y: floating.y
  }
}

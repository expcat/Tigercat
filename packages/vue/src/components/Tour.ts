import {
  defineComponent,
  computed,
  h,
  ref,
  watch,
  nextTick,
  onBeforeUnmount,
  onUnmounted,
  useId,
  type PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  tourPopoverClasses,
  tourTitleClasses,
  tourDescriptionClasses,
  tourFooterClasses,
  tourIndicatorClasses,
  tourCloseButtonClasses,
  tourMaskClasses,
  tourPrevButtonGapClass,
  resolveTourTarget,
  scrollTourTargetIntoView,
  getTourRectFromElement,
  getTourSizeFromElement,
  getFirstTourStepIndex,
  getTourPopoverStyle,
  getTourShadeStyle,
  getTourMaskHoleStyle,
  syncModalInert,
  resolveTourNav,
  getTourStepContext,
  shouldLockTourOverlay,
  tourNextEvents,
  tourPrevEvents,
  tourCloseEvents,
  tourArrowKey,
  tourStepAdvancesOnTarget,
  tourTargetExempt,
  getFloatingArrowStyle,
  getPopconfirmArrowClasses,
  shouldCloseOnMaskClick,
  getTourLabels,
  mergeTigerLocale,
  captureActiveElement,
  restoreFocus,
  type TourStep,
  type TourStepLoader,
  type TourStepContext,
  type TourPlacement,
  type TourRect,
  type TourSize,
  type TourNavEvent,
  type TigerLocale
} from '@expcat/tigercat-core'
import { closeIconPathD } from '@expcat/tigercat-core/icons/common'
import { createStatusIcon } from '../utils/icon-helpers'
import {
  useVueBodyScrollLock,
  useVueEscapeKey,
  useVueFocusTrap,
  useVueOverlayPortalTarget
} from '../utils/overlay'
import { renderVueOverlayOutlet } from '../utils/overlay-outlet'
import { Button } from './Button'
import { useTigerConfig } from './tiger-config'

export interface VueTourProps {
  steps: TourStep[]
  loadSteps?: TourStepLoader
  open?: boolean
  current?: number
  nextText?: string
  prevText?: string
  finishText?: string
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  showIndicators?: boolean
  /**
   * CSS selector for the node inside the bubble to focus when the step opens.
   * Defaults to the bubble itself.
   */
  initialFocus?: string
  locale?: Partial<TigerLocale>
  className?: string
  style?: Record<string, unknown>
}

export type TourProps = VueTourProps

export const Tour = defineComponent({
  name: 'TigerTour',
  inheritAttrs: false,
  props: {
    steps: {
      type: Array as PropType<TourStep[]>,
      required: true
    },
    loadSteps: {
      type: Function as PropType<TourStepLoader>,
      default: undefined
    },
    open: {
      type: Boolean,
      default: false
    },
    current: {
      type: Number,
      default: undefined
    },
    nextText: { type: String, default: undefined },
    prevText: { type: String, default: undefined },
    finishText: { type: String, default: undefined },
    closable: { type: Boolean, default: true },
    maskClosable: { type: Boolean, default: true },
    keyboard: { type: Boolean, default: true },
    showIndicators: { type: Boolean, default: true },
    initialFocus: { type: String, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, unknown>>, default: undefined }
  },
  emits: ['update:open', 'update:current', 'close', 'finish', 'change'],
  setup(props, { emit, attrs, slots, expose }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() =>
      getTourLabels(mergedLocale.value, {
        nextText: props.nextText,
        prevText: props.prevText,
        finishText: props.finishText
      })
    )
    const direction = computed<'ltr' | 'rtl'>(() =>
      config.value.direction === 'rtl' || mergedLocale.value?.direction === 'rtl' ? 'rtl' : 'ltr'
    )
    const internalStep = ref(0)
    const resolvedSteps = ref<TourStep[]>([])
    const loadPhase = ref<'idle' | 'loading' | 'ready' | 'error'>('idle')
    const displayedSteps = computed(() => (props.loadSteps ? resolvedSteps.value : props.steps))
    const currentStep = computed(() => props.current ?? internalStep.value)
    const nav = computed(() => resolveTourNav(displayedSteps.value, currentStep.value))
    const ctx = computed((): TourStepContext | undefined => getTourStepContext(nav.value))
    const step = computed(() => ctx.value?.step)
    const visible = computed(() => shouldLockTourOverlay(props.open, Boolean(step.value)))
    const showError = computed(() => props.open && loadPhase.value === 'error')
    const overlayActive = computed(() => visible.value || showError.value)
    const targetRect = ref<TourRect | undefined>()
    const popoverSize = ref<TourSize | undefined>()
    const rootRef = ref<HTMLElement | null>(null)
    const popoverRef = ref<HTMLElement | null>(null)
    const closeButtonRef = ref<HTMLButtonElement | null>(null)
    const targetExemptRef = ref<HTMLElement | null>(null)
    const { anchorRef, target: portalTarget } = useVueOverlayPortalTarget()
    const instanceId = `tiger-tour-${useId()}`
    const titleId = `${instanceId}-title`
    const descriptionId = `${instanceId}-description`
    let previousActiveElement: HTMLElement | null = null
    let loadToken = 0
    let openedOnce = false
    let resizeObserver: ResizeObserver | undefined
    const scrolledKey = ref('')

    let advanceCleanup: (() => void) | undefined
    const bindAdvance = (el: HTMLElement | null, current: TourStep) => {
      advanceCleanup?.()
      advanceCleanup = undefined
      if (!el || !tourStepAdvancesOnTarget(current)) return
      const onClick = () => next()
      el.addEventListener('click', onClick)
      advanceCleanup = () => el.removeEventListener('click', onClick)
    }
    onBeforeUnmount(() => advanceCleanup?.())

    const measure = (shouldScroll: boolean) => {
      const current = step.value
      if (!props.open || !current) {
        targetRect.value = undefined
        targetExemptRef.value = null
        syncModalInert()
        return
      }
      const targetEl = resolveTourTarget(current.target)
      targetExemptRef.value = tourTargetExempt(current) ? (targetEl ?? null) : null
      bindAdvance(targetEl ?? null, current)
      if (targetEl) {
        if (shouldScroll) scrollTourTargetIntoView(targetEl)
        targetRect.value = getTourRectFromElement(targetEl)
      } else {
        targetRect.value = undefined
      }
      const size = getTourSizeFromElement(popoverRef.value)
      if (size) popoverSize.value = size
      syncModalInert()
    }

    watch(
      [() => props.open, () => typeof props.loadSteps === 'function'],
      ([open]) => {
        const token = ++loadToken
        if (!open) {
          if (openedOnce) {
            restoreFocus(previousActiveElement)
            previousActiveElement = null
            const source = props.loadSteps ? resolvedSteps.value : props.steps
            const first = getFirstTourStepIndex(source)
            internalStep.value = first
            if (props.current !== undefined) emit('update:current', first)
          }
          openedOnce = false
          loadPhase.value = 'idle'
          scrolledKey.value = ''
          return
        }
        openedOnce = true
        previousActiveElement = captureActiveElement()
        const loader = props.loadSteps
        if (!loader) {
          loadPhase.value = 'ready'
          return
        }
        loadPhase.value = 'loading'
        resolvedSteps.value = []
        void Promise.resolve(loader())
          .then((next) => {
            if (token !== loadToken) return
            resolvedSteps.value = next
            loadPhase.value = 'ready'
          })
          .catch(() => {
            if (token !== loadToken) return
            loadPhase.value = 'error'
          })
      },
      { immediate: true }
    )

    watch(
      [visible, currentStep, () => step.value?.target],
      () => {
        if (!visible.value) return
        const key = String(currentStep.value)
        const shouldScroll = scrolledKey.value !== key
        scrolledKey.value = key
        nextTick(() => measure(shouldScroll))
      },
      { immediate: true, flush: 'post' }
    )

    const onViewportChange = () => {
      if (props.open) measure(false)
    }

    watch(
      visible,
      (isVisible) => {
        resizeObserver?.disconnect()
        resizeObserver = undefined
        window.removeEventListener('resize', onViewportChange)
        window.removeEventListener('scroll', onViewportChange, true)
        if (!isVisible || typeof window === 'undefined') return
        window.addEventListener('resize', onViewportChange)
        window.addEventListener('scroll', onViewportChange, true)
        if (typeof ResizeObserver !== 'function') return
        resizeObserver = new ResizeObserver(() => measure(false))
        if (popoverRef.value) resizeObserver.observe(popoverRef.value)
        const targetEl = resolveTourTarget(step.value?.target)
        if (targetEl) resizeObserver.observe(targetEl)
      },
      { immediate: true, flush: 'post' }
    )

    const focusKey = ref('')
    watch(
      [visible, currentStep, () => props.initialFocus],
      () => {
        if (!visible.value) {
          focusKey.value = ''
          return
        }
        nextTick(() => {
          const root = popoverRef.value
          if (!root) return
          const opened = focusKey.value === ''
          focusKey.value = String(currentStep.value)
          if (opened && props.initialFocus) {
            const specified = root.querySelector(props.initialFocus)
            if (specified instanceof HTMLElement) {
              specified.focus()
              return
            }
          }
          root.focus()
        })
      },
      { immediate: true, flush: 'post' }
    )

    onBeforeUnmount(() => {
      loadToken += 1
      resizeObserver?.disconnect()
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', onViewportChange)
        window.removeEventListener('scroll', onViewportChange, true)
      }
    })
    onUnmounted(() => {
      restoreFocus(previousActiveElement)
      previousActiveElement = null
    })

    const applyNavEvents = (events: TourNavEvent[]) => {
      for (const event of events) {
        if (event.type === 'change') {
          internalStep.value = event.index
          emit('update:current', event.index)
          emit('change', event.index)
        } else if (event.type === 'finish') {
          emit('finish')
        } else if (event.type === 'close') {
          emit('close')
        } else {
          emit('update:open', event.open)
        }
      }
    }

    const next = () => applyNavEvents(tourNextEvents(nav.value))
    const prev = () => applyNavEvents(tourPrevEvents(nav.value))
    const close = () => applyNavEvents(tourCloseEvents())

    const escapeEnabled = computed(() => overlayActive.value && props.keyboard)
    const detachEscape = useVueEscapeKey({
      enabled: escapeEnabled,
      onEscape: close,
      layerRef: rootRef
    })
    onBeforeUnmount(detachEscape)
    useVueBodyScrollLock(overlayActive)
    useVueFocusTrap({
      enabled: overlayActive,
      containerRef: rootRef,
      inert: true,
      autoFocus: true,
      initialFocusRef: popoverRef,
      exemptRef: targetExemptRef
    })

    expose({ close })

    const renderLayer = (children: unknown[]) =>
      h(
        'div',
        {
          ref: rootRef,
          class: 'contents',
          'data-tiger-overlay-layer': '',
          'data-tiger-tour-root': ''
        },
        children as never
      )

    return () => {
      const anchor = h('span', { ref: anchorRef, hidden: true })
      if (showError.value) {
        const errorDialog = renderLayer([
          h(
            'div',
            {
              ref: popoverRef,
              class: tourPopoverClasses,
              role: 'dialog',
              'aria-modal': 'true',
              'aria-label': labels.value.loadErrorText,
              tabindex: -1,
              'data-tiger-tour': ''
            },
            [
              h('p', labels.value.loadErrorText),
              h(
                Button,
                { type: 'button', size: 'sm', onClick: close },
                { default: () => labels.value.closeAriaLabel }
              )
            ]
          ),
          h('div', { class: 'contents', 'data-tiger-overlay-host': '' })
        ])
        return [anchor, renderVueOverlayOutlet(instanceId, errorDialog, portalTarget.value)]
      }

      if (!visible.value || !step.value || !ctx.value) {
        return [anchor, renderVueOverlayOutlet(instanceId, null)]
      }

      const current = ctx.value
      const placement: TourPlacement = current.step.placement ?? 'bottom'
      const showMask = current.step.mask !== false
      const popoverStyle = mergeStyleValues(
        getTourPopoverStyle(targetRect.value, popoverSize.value, placement, direction.value),
        attrs.style,
        props.style
      )
      const hasTitle = Boolean(slots.title || current.step.title)
      const hasDescription = Boolean(slots.description || current.step.description)
      const ariaLabelledbyFromAttrs =
        typeof attrs['aria-labelledby'] === 'string'
          ? (attrs['aria-labelledby'] as string)
          : undefined
      const ariaLabelFromAttrs =
        typeof attrs['aria-label'] === 'string' ? (attrs['aria-label'] as string) : undefined
      const ariaDescribedbyFromAttrs =
        typeof attrs['aria-describedby'] === 'string'
          ? (attrs['aria-describedby'] as string)
          : undefined

      const children = []

      if (showMask) {
        children.push(
          h('div', {
            class: classNames(tourMaskClasses, 'bg-transparent'),
            'data-tiger-tour-mask': '',
            'aria-hidden': 'true',
            style: {
              ...(tourTargetExempt(current.step) && targetRect.value
                ? getTourMaskHoleStyle(targetRect.value)
                : null),
              ...(targetRect.value && !tourTargetExempt(current.step)
                ? { backgroundColor: 'transparent' }
                : null)
            },
            onClick: (event: MouseEvent) => {
              if (shouldCloseOnMaskClick(event, props.maskClosable)) close()
            }
          })
        )
        children.push(
          h('div', {
            class: 'pointer-events-none',
            'data-tiger-tour-shade': '',
            style: targetRect.value
              ? getTourShadeStyle(targetRect.value)
              : { pointerEvents: 'none' }
          })
        )
      }

      const popoverChildren = []

      if (props.closable) {
        popoverChildren.push(
          h(
            'button',
            {
              ref: closeButtonRef,
              class: tourCloseButtonClasses,
              type: 'button',
              'aria-label': labels.value.closeAriaLabel,
              onClick: close
            },
            createStatusIcon(closeIconPathD, 'h-4 w-4', {
              'aria-hidden': 'true',
              focusable: 'false'
            })
          )
        )
      }

      if (current.step.cover) {
        popoverChildren.push(
          h('img', {
            src: current.step.cover,
            alt: current.step.coverAlt ?? '',
            'data-tiger-tour-cover': ''
          })
        )
      }
      if (current.step.arrow !== false) {
        popoverChildren.push(
          h('span', {
            'data-tiger-tour-arrow': '',
            class: getPopconfirmArrowClasses(),
            style: getFloatingArrowStyle(placement)
          })
        )
      }

      if (hasTitle) {
        const titleNode = slots.title?.(current) ?? current.step.title
        popoverChildren.push(h('div', { id: titleId, class: tourTitleClasses }, titleNode))
      }
      if (hasDescription) {
        const descriptionNode = slots.description?.(current) ?? current.step.description
        popoverChildren.push(
          h('div', { id: descriptionId, class: tourDescriptionClasses }, descriptionNode)
        )
      }
      if (slots.content) popoverChildren.push(slots.content(current))
      if (slots.default) popoverChildren.push(slots.default(current))

      if (slots.footer) {
        popoverChildren.push(slots.footer(current))
      } else {
        const footerChildren = []
        if (props.showIndicators) {
          footerChildren.push(
            h('span', { class: tourIndicatorClasses }, `${current.position + 1} / ${current.total}`)
          )
        }
        const buttons = []
        if (!nav.value.isFirst) {
          buttons.push(
            h(
              Button,
              {
                type: 'button',
                size: 'sm',
                variant: 'secondary',
                className: tourPrevButtonGapClass,
                onClick: prev
              },
              { default: () => labels.value.prevText }
            )
          )
        }
        buttons.push(
          h(
            Button,
            { type: 'button', size: 'sm', onClick: next },
            { default: () => (nav.value.isLast ? labels.value.finishText : labels.value.nextText) }
          )
        )
        footerChildren.push(h('div', { class: 'flex items-center' }, buttons))
        popoverChildren.push(h('div', { class: tourFooterClasses }, footerChildren))
      }

      const {
        class: _className,
        style: _style,
        role: _role,
        tabindex: _tabIndex,
        ...restAttrs
      } = attrs as Record<string, unknown>

      children.push(
        h(
          'div',
          {
            ...restAttrs,
            ref: popoverRef,
            onKeydown: (event: KeyboardEvent) => {
              const dir = tourArrowKey(event.key, event.target)
              if (dir === 'next') {
                event.preventDefault()
                next()
              } else if (dir === 'prev') {
                event.preventDefault()
                prev()
              }
            },
            class: classNames(tourPopoverClasses, props.className, coerceClassValue(attrs.class)),
            style: popoverStyle,
            role: 'dialog',
            'aria-modal': 'true',
            'aria-labelledby': ariaLabelledbyFromAttrs ?? (hasTitle ? titleId : undefined),
            'aria-label':
              ariaLabelFromAttrs ?? (hasTitle ? undefined : labels.value.dialogAriaLabel),
            'aria-describedby':
              ariaDescribedbyFromAttrs ?? (hasDescription ? descriptionId : undefined),
            tabindex: -1,
            'data-tiger-tour': ''
          },
          popoverChildren
        )
      )
      children.push(h('div', { class: 'contents', 'data-tiger-overlay-host': '' }))

      return [anchor, renderVueOverlayOutlet(instanceId, renderLayer(children), portalTarget.value)]
    }
  }
})

export default Tour

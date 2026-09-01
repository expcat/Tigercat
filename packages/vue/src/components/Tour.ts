import {
  defineComponent,
  computed,
  h,
  ref,
  watch,
  nextTick,
  onMounted,
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
  getTourPopoverStyle,
  getTourMaskHoleStyle,
  resolveTourNav,
  getTourStepContext,
  shouldLockTourOverlay,
  tourNextEvents,
  tourPrevEvents,
  tourCloseEvents,
  shouldCloseOnMaskClick,
  getTourLabels,
  closeIconPathD,
  mergeTigerLocale,
  captureActiveElement,
  focusFirst,
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
import { createStatusIcon } from '../utils/icon-helpers'
import {
  renderVueOverlayTeleport,
  useVueBodyScrollLock,
  useVueEscapeKey,
  useVueFocusTrap,
  useVueOverlayPortalTarget
} from '../utils/overlay'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'

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
    const internalStep = ref(0)
    const resolvedSteps = ref<TourStep[]>(props.steps)
    const currentStep = computed(() => props.current ?? internalStep.value)
    const nav = computed(() => resolveTourNav(resolvedSteps.value, currentStep.value))
    const ctx = computed((): TourStepContext | undefined => getTourStepContext(nav.value))
    const step = computed(() => ctx.value?.step)
    const visible = computed(() => shouldLockTourOverlay(props.open, Boolean(step.value)))
    const targetRect = ref<TourRect | undefined>()
    const popoverSize = ref<TourSize | undefined>()
    const rootRef = ref<HTMLElement | null>(null)
    const popoverRef = ref<HTMLElement | null>(null)
    const closeButtonRef = ref<HTMLButtonElement | null>(null)
    const { anchorRef, target: portalTarget } = useVueOverlayPortalTarget()
    const instanceId = `tiger-tour-${useId()}`
    const titleId = `${instanceId}-title`
    const descriptionId = `${instanceId}-description`
    let previousActiveElement: HTMLElement | null = null
    let loadGeneration = 0
    let resizeObserver: ResizeObserver | undefined

    const updateRect = () => {
      if (!props.open || !step.value) {
        targetRect.value = undefined
        return
      }
      const targetEl = resolveTourTarget(step.value.target)
      if (targetEl) {
        scrollTourTargetIntoView(targetEl)
        targetRect.value = getTourRectFromElement(targetEl)
      } else {
        targetRect.value = undefined
      }
      const size = getTourSizeFromElement(popoverRef.value)
      if (size) popoverSize.value = size
    }

    const loadResolvedSteps = async () => {
      const generation = ++loadGeneration
      if (!props.loadSteps) {
        resolvedSteps.value = props.steps
        return
      }
      try {
        const next = await props.loadSteps()
        if (generation === loadGeneration) resolvedSteps.value = next
      } catch {
        /* keep the previous list */
      }
    }

    watch(
      () => props.steps,
      (next) => {
        if (!props.loadSteps) resolvedSteps.value = next
      }
    )

    watch(
      () => props.open,
      (open) => {
        if (open) {
          if (props.current === undefined) internalStep.value = 0
          previousActiveElement = captureActiveElement()
          void loadResolvedSteps()
        } else {
          restoreFocus(previousActiveElement)
          previousActiveElement = null
          internalStep.value = 0
        }
      },
      { immediate: true }
    )

    watch(
      () => [props.open, currentStep.value, step.value, step.value?.target] as const,
      () => {
        if (props.open) updateRect()
      },
      { immediate: true }
    )

    const bindObservers = () => {
      resizeObserver?.disconnect()
      resizeObserver = undefined
      if (!visible.value || typeof ResizeObserver !== 'function') return
      resizeObserver = new ResizeObserver(() => updateRect())
      if (popoverRef.value) resizeObserver.observe(popoverRef.value)
      const targetEl = resolveTourTarget(step.value?.target)
      if (targetEl) resizeObserver.observe(targetEl)
    }

    const onViewportChange = () => {
      if (props.open) updateRect()
    }

    onMounted(() => {
      window.addEventListener('resize', onViewportChange)
      window.addEventListener('scroll', onViewportChange, true)
      bindObservers()
    })
    onBeforeUnmount(() => {
      loadGeneration += 1
      resizeObserver?.disconnect()
      window.removeEventListener('resize', onViewportChange)
      window.removeEventListener('scroll', onViewportChange, true)
    })
    onUnmounted(() => {
      restoreFocus(previousActiveElement)
      previousActiveElement = null
    })

    watch(
      visible,
      (isVisible) => {
        if (!isVisible) return
        nextTick(() => {
          updateRect()
          bindObservers()
          focusFirst([closeButtonRef.value, popoverRef.value])
        })
      },
      { immediate: true, flush: 'post' }
    )

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

    const overlayEnabled = computed(() => visible.value)
    const escapeEnabled = computed(() => visible.value && props.keyboard)
    const detachEscape = useVueEscapeKey({
      enabled: escapeEnabled,
      onEscape: close,
      layerRef: rootRef
    })
    onBeforeUnmount(detachEscape)
    useVueBodyScrollLock(overlayEnabled)
    useVueFocusTrap({ enabled: overlayEnabled, containerRef: rootRef, inert: true })

    expose({ close })

    return () => {
      const anchor = h('span', { ref: anchorRef, hidden: true })
      if (!visible.value || !step.value || !ctx.value) return anchor

      const current = ctx.value
      const placement: TourPlacement = current.step.placement ?? 'bottom'
      const showMask = current.step.mask !== false
      const popoverStyle = mergeStyleValues(
        getTourPopoverStyle(targetRect.value, popoverSize.value, placement),
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
            class: tourMaskClasses,
            'data-tiger-tour-mask': '',
            'aria-hidden': 'true',
            style: targetRect.value ? getTourMaskHoleStyle(targetRect.value) : undefined,
            onClick: (event: MouseEvent) => {
              if (shouldCloseOnMaskClick(event, props.maskClosable)) close()
            }
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
            h(
              'span',
              { class: tourIndicatorClasses, 'aria-live': 'polite' },
              `${current.position + 1} / ${current.total}`
            )
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

      return [
        anchor,
        renderVueOverlayTeleport(
          h(
            'div',
            {
              ref: rootRef,
              class: 'contents',
              'data-tiger-overlay-layer': '',
              'data-tiger-tour-root': ''
            },
            children
          ),
          portalTarget.value
        )
      ]
    }
  }
})

export default Tour

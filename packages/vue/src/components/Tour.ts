import {
  defineComponent,
  computed,
  h,
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  PropType,
  Teleport
} from 'vue'
import {
  classNames,
  tourPopoverClasses,
  tourTitleClasses,
  tourDescriptionClasses,
  tourFooterClasses,
  tourIndicatorClasses,
  tourCloseButtonClasses,
  getTourTargetRect,
  getTourPopoverPosition,
  getTourSpotlightStyle,
  getActiveTourSteps,
  getCurrentActiveTourStep,
  getActiveTourStepPosition,
  closeIconPathD,
  mergeTigerLocale,
  resolveLocaleText,
  type TourStep,
  type TourStepLoader,
  type TourPlacement,
  type TourRect,
  type TigerLocale
} from '@expcat/tigercat-core'
import { createStatusIcon } from '../utils/icon-helpers'
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
  showIndicators?: boolean
  locale?: Partial<TigerLocale>
  className?: string
}

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
    showIndicators: { type: Boolean, default: true },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    className: { type: String, default: undefined }
  },
  emits: ['update:open', 'update:current', 'close', 'finish', 'change'],
  setup(props, { emit }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const nextLabel = computed(() =>
      resolveLocaleText('Next', props.nextText, mergedLocale.value?.formWizard?.nextText)
    )
    const prevLabel = computed(() =>
      resolveLocaleText('Previous', props.prevText, mergedLocale.value?.formWizard?.prevText)
    )
    const finishLabel = computed(() =>
      resolveLocaleText('Finish', props.finishText, mergedLocale.value?.formWizard?.finishText)
    )
    const internalStep = ref(0)
    const resolvedSteps = ref<TourStep[]>(props.steps)
    const currentStep = computed(() => props.current ?? internalStep.value)
    const activeSteps = computed(() => getActiveTourSteps(resolvedSteps.value))
    const activeStepInfo = computed(() =>
      getCurrentActiveTourStep(activeSteps.value, currentStep.value, resolvedSteps.value.length)
    )
    const activeStepPosition = computed(() =>
      getActiveTourStepPosition(activeSteps.value, activeStepInfo.value?.index)
    )
    const step = computed(() => activeStepInfo.value?.step)
    const targetRect = ref<TourRect | undefined>()
    const popoverRef = ref<HTMLElement | null>(null)

    const updateRect = () => {
      if (step.value?.target) {
        targetRect.value = getTourTargetRect(step.value.target)
      } else {
        targetRect.value = undefined
      }
    }

    const loadSteps = async () => {
      if (!props.loadSteps) {
        resolvedSteps.value = props.steps
        return
      }

      resolvedSteps.value = await props.loadSteps()
    }

    watch(
      () => props.steps,
      (next) => {
        if (!props.loadSteps) {
          resolvedSteps.value = next
        }
      }
    )

    watch(
      () => props.open,
      (open) => {
        if (open) void loadSteps()
      },
      { immediate: true }
    )

    watch(
      () => [props.open, currentStep.value],
      () => {
        if (props.open) updateRect()
      }
    )
    onMounted(() => {
      if (props.open) updateRect()
    })

    let resizeHandler: (() => void) | undefined
    onMounted(() => {
      resizeHandler = () => {
        if (props.open) updateRect()
      }
      window.addEventListener('resize', resizeHandler)
      window.addEventListener('scroll', resizeHandler, true)
    })
    onBeforeUnmount(() => {
      if (resizeHandler) {
        window.removeEventListener('resize', resizeHandler)
        window.removeEventListener('scroll', resizeHandler, true)
      }
    })

    const goTo = (idx: number) => {
      internalStep.value = idx
      emit('update:current', idx)
      emit('change', idx)
    }

    const next = () => {
      const nextStep = activeSteps.value[activeStepPosition.value + 1]
      if (nextStep) {
        goTo(nextStep.index)
      } else {
        emit('finish')
        emit('update:open', false)
      }
    }

    const prev = () => {
      const prevStep = activeSteps.value[activeStepPosition.value - 1]
      if (prevStep) {
        goTo(prevStep.index)
      }
    }

    const close = () => {
      emit('close')
      emit('update:open', false)
    }

    return () => {
      if (!props.open || !step.value) return null

      const placement: TourPlacement = step.value.placement ?? 'bottom'
      const showMask = step.value.mask !== false
      const isLast = activeStepPosition.value === activeSteps.value.length - 1
      const isFirst = activeStepPosition.value <= 0

      // Position
      let popoverStyle: Record<string, string> = {}
      if (targetRect.value) {
        const pos = getTourPopoverPosition(targetRect.value, 320, 160, placement)
        popoverStyle = {
          position: 'absolute',
          top: `${pos.top}px`,
          left: `${pos.left}px`
        }
      } else {
        popoverStyle = {
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
      }

      const children = []

      // Spotlight mask
      if (showMask && targetRect.value) {
        children.push(
          h('div', {
            style: getTourSpotlightStyle(targetRect.value),
            'aria-hidden': 'true'
          })
        )
      } else if (showMask) {
        children.push(
          h('div', {
            class: 'fixed inset-0 z-[1000] bg-black/45',
            'aria-hidden': 'true',
            onClick: close
          })
        )
      }

      // Popover
      const popoverChildren = []

      // Close button
      if (props.closable) {
        popoverChildren.push(
          h(
            'button',
            {
              class: tourCloseButtonClasses,
              type: 'button',
              'aria-label': 'Close tour',
              onClick: close
            },
            createStatusIcon(closeIconPathD, 'h-4 w-4')
          )
        )
      }

      if (step.value.title) {
        popoverChildren.push(h('div', { class: tourTitleClasses }, step.value.title))
      }
      if (step.value.description) {
        popoverChildren.push(h('div', { class: tourDescriptionClasses }, step.value.description))
      }

      // Footer
      const footerChildren = []
      if (props.showIndicators) {
        footerChildren.push(
          h(
            'span',
            { class: tourIndicatorClasses },
            `${activeStepPosition.value + 1} / ${activeSteps.value.length}`
          )
        )
      }

      const buttons = []
      if (!isFirst) {
        buttons.push(
          h(
            'button',
            {
              type: 'button',
              class:
                'px-3 py-1.5 text-sm rounded-md border border-[var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)] hover:bg-[var(--tiger-surface-muted,#f9fafb)] transition-colors mr-2',
              onClick: prev
            },
            prevLabel.value
          )
        )
      }
      buttons.push(
        h(
          'button',
          {
            type: 'button',
            class:
              'px-3 py-1.5 text-sm rounded-md bg-[var(--tiger-primary,#2563eb)] text-white hover:bg-[var(--tiger-primary-hover,#1d4ed8)] transition-colors',
            onClick: next
          },
          isLast ? finishLabel.value : nextLabel.value
        )
      )

      footerChildren.push(h('div', { class: 'flex items-center' }, buttons))
      popoverChildren.push(h('div', { class: tourFooterClasses }, footerChildren))

      children.push(
        h(
          'div',
          {
            ref: popoverRef,
            class: classNames(tourPopoverClasses, props.className),
            style: popoverStyle,
            role: 'dialog',
            'aria-modal': 'true'
          },
          popoverChildren
        )
      )

      return h(Teleport, { to: 'body' }, children)
    }
  }
})

export default Tour

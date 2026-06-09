import { defineComponent, computed, ref, watch, h, PropType, type Component } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getFormWizardLabels,
  mergeTigerLocale,
  resolveLocaleText,
  clampStepIndex,
  findNextUnskippedStep,
  runStepValidation,
  type WizardStep,
  type StepsDirection,
  type StepSize,
  type FormWizardValidator,
  type TigerLocale,
  type TigerLocaleFormWizard
} from '@expcat/tigercat-core'
import { Steps, StepsItem } from './Steps'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'

type HChildren = Parameters<typeof h>[2]

const renderArrowLeftIcon = () =>
  h(
    'svg',
    {
      class: 'w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-0.5',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      viewBox: '0 0 24 24',
      'aria-hidden': 'true'
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18'
      })
    ]
  )

const renderArrowRightIcon = () =>
  h(
    'svg',
    {
      class: 'w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2',
      viewBox: '0 0 24 24',
      'aria-hidden': 'true'
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'
      })
    ]
  )

const renderCheckIcon = () =>
  h(
    'svg',
    {
      class: 'w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2.5',
      viewBox: '0 0 24 24',
      'aria-hidden': 'true'
    },
    [
      h('path', {
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        d: 'M4.5 12.75l6 6 9-13.5'
      })
    ]
  )

export interface VueFormWizardProps {
  steps?: WizardStep[]
  current?: number
  defaultCurrent?: number
  clickable?: boolean
  direction?: StepsDirection
  size?: StepSize
  simple?: boolean
  showSteps?: boolean
  showActions?: boolean
  prevText?: string
  nextText?: string
  finishText?: string
  beforeNext?: FormWizardValidator
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleFormWizard>
  className?: string
  style?: Record<string, string | number>
}

export const FormWizard = defineComponent({
  name: 'TigerFormWizard',
  inheritAttrs: false,
  props: {
    steps: {
      type: Array as PropType<WizardStep[]>,
      default: () => []
    },
    current: {
      type: Number,
      default: undefined
    },
    defaultCurrent: {
      type: Number,
      default: 0
    },
    clickable: {
      type: Boolean,
      default: false
    },
    direction: {
      type: String as PropType<StepsDirection>,
      default: 'horizontal' as StepsDirection
    },
    size: {
      type: String as PropType<StepSize>,
      default: 'default' as StepSize
    },
    simple: {
      type: Boolean,
      default: false
    },
    showSteps: {
      type: Boolean,
      default: true
    },
    showActions: {
      type: Boolean,
      default: true
    },
    prevText: {
      type: String,
      default: undefined
    },
    nextText: {
      type: String,
      default: undefined
    },
    finishText: {
      type: String,
      default: undefined
    },
    beforeNext: {
      type: Function as PropType<FormWizardValidator>,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleFormWizard>>,
      default: undefined
    },
    bordered: {
      type: Boolean,
      default: true
    },
    autoSave: {
      type: Function as PropType<(current: number, step: WizardStep) => void | Promise<void>>,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['change', 'update:current', 'finish'],
  setup(props, { slots, attrs, emit }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getFormWizardLabels(mergedLocale.value, props.labels))

    const innerCurrent = ref(props.current ?? props.defaultCurrent)

    watch(
      () => props.current,
      (value) => {
        if (value !== undefined) {
          innerCurrent.value = value
        }
      }
    )

    watch(
      () => props.defaultCurrent,
      (value) => {
        if (props.current === undefined && value !== undefined) {
          innerCurrent.value = value
        }
      }
    )

    const totalCount = computed(() => props.steps.length)
    const currentIndex = computed(() => props.current ?? innerCurrent.value ?? 0)
    const currentStep = computed(() => props.steps[currentIndex.value])

    const wrapperClasses = computed(() =>
      classNames(
        'tiger-form-wizard w-full overflow-hidden transition-all duration-300',
        props.bordered
          ? 'rounded-[var(--tiger-radius-md,0.5rem)] border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] shadow-sm'
          : 'bg-transparent',
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    const wrapperStyle = computed(() =>
      mergeStyleValues((attrs as Record<string, unknown>).style, props.style)
    )

    const setCurrent = (next: number) => {
      const clamped = clampStepIndex(next, totalCount.value)
      const prev = currentIndex.value
      if (props.current === undefined) {
        innerCurrent.value = clamped
      }
      emit('update:current', clamped)
      emit('change', clamped, prev)
      if (props.autoSave && props.steps[clamped]) {
        props.autoSave(clamped, props.steps[clamped])
      }
    }

    const runBeforeNext = (): Promise<boolean> =>
      runStepValidation(currentIndex.value, currentStep.value, props.steps, props.beforeNext)

    const findNextUnskipped = (from: number, direction: 1 | -1): number =>
      findNextUnskippedStep(from, direction, props.steps, currentIndex.value)

    const handlePrev = () => {
      if (currentIndex.value <= 0) return
      const target = findNextUnskipped(currentIndex.value - 1, -1)
      if (target === currentIndex.value) return
      setCurrent(target)
    }

    const handleNext = async () => {
      if (totalCount.value === 0) return
      const isLast = currentIndex.value >= totalCount.value - 1
      const ok = await runBeforeNext()
      if (!ok) return
      if (isLast) {
        emit('finish', currentIndex.value, props.steps)
        return
      }
      const target = findNextUnskipped(currentIndex.value + 1, 1)
      if (target === currentIndex.value) return
      setCurrent(target)
    }

    const handleStepChange = async (nextIndex: number) => {
      if (nextIndex === currentIndex.value || props.steps[nextIndex]?.disabled) return
      if (nextIndex > currentIndex.value) {
        const ok = await runBeforeNext()
        if (!ok) return
      }
      setCurrent(nextIndex)
    }

    const renderContent = () => {
      if (!currentStep.value) {
        return null
      }

      if (slots.step) {
        return slots.step({ step: currentStep.value, index: currentIndex.value })
      }

      if (slots.default) {
        return slots.default({ step: currentStep.value, index: currentIndex.value })
      }

      if (currentStep.value.content != null) {
        return currentStep.value.content as HChildren
      }

      return null
    }

    return () => {
      const stepsNodes = props.steps.map((step, index) =>
        h(StepsItem as unknown as Component, {
          key: step.key ?? index,
          title: step.title,
          description: step.description,
          status: step.status,
          icon: step.icon,
          disabled: step.disabled
        })
      )

      const isFirst = currentIndex.value <= 0
      const isLast = currentIndex.value >= totalCount.value - 1

      const stepsHeaderClass = classNames(
        'px-6 py-5 bg-[var(--tiger-surface-muted,#f9fafb)]/95 backdrop-blur-sm transition-all duration-300',
        props.bordered ? 'border-b border-[var(--tiger-border,#e5e7eb)]' : ''
      )

      const actionsContainerClass = classNames(
        'flex items-center justify-between gap-3 px-8 py-4 bg-[var(--tiger-surface-muted,#f9fafb)]/95 backdrop-blur-sm transition-all duration-300',
        props.bordered ? 'border-t border-[var(--tiger-border,#e5e7eb)]' : ''
      )

      return h(
        'div',
        {
          ...attrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          'data-tiger-form-wizard': ''
        },
        [
          props.showSteps && props.steps.length > 0
            ? h('div', { class: stepsHeaderClass }, [
                h(
                  Steps,
                  {
                    current: currentIndex.value,
                    direction: props.direction,
                    size: props.size,
                    simple: props.simple,
                    clickable: props.clickable,
                    'onUpdate:current': handleStepChange
                  },
                  { default: () => stepsNodes }
                )
              ])
            : null,
          h(
            'div',
            {
              class:
                'px-8 py-6 flex flex-col items-center w-full min-h-[120px] transition-all duration-300'
            },
            { default: () => renderContent() }
          ),
          props.showActions
            ? h('div', { class: actionsContainerClass }, [
                !isFirst
                  ? h(
                      Button,
                      {
                        type: 'button',
                        variant: 'secondary',
                        class: 'group',
                        onClick: handlePrev,
                        size: props.size === 'small' ? 'sm' : 'md',
                        icon: renderArrowLeftIcon()
                      },
                      { default: () => resolveLocaleText(labels.value.prevText, props.prevText) }
                    )
                  : h('div'),
                h(
                  Button,
                  {
                    type: 'button',
                    variant: 'primary',
                    class: 'group',
                    onClick: handleNext,
                    size: props.size === 'small' ? 'sm' : 'md',
                    icon: isLast ? renderCheckIcon() : renderArrowRightIcon(),
                    iconPosition: isLast ? 'left' : 'right'
                  },
                  {
                    default: () =>
                      isLast
                        ? resolveLocaleText(labels.value.finishText, props.finishText)
                        : resolveLocaleText(labels.value.nextText, props.nextText)
                  }
                )
              ])
            : null
        ]
      )
    }
  }
})

export default FormWizard

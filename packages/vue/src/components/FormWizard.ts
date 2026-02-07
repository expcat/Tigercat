import { defineComponent, computed, ref, watch, h, PropType, type Component } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getFormWizardLabels,
  mergeTigerLocale,
  resolveLocaleText,
  type WizardStep,
  type StepsDirection,
  type StepSize,
  type FormWizardValidator,
  type TigerLocale
} from '@expcat/tigercat-core'
import { Steps } from './Steps'
import { StepsItem } from './StepsItem'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'

type HChildren = Parameters<typeof h>[2]

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
    const labels = computed(() => getFormWizardLabels(mergedLocale.value))

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
        'tiger-form-wizard w-full rounded-lg border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] shadow-sm overflow-hidden',
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )
    )

    const wrapperStyle = computed(() =>
      mergeStyleValues((attrs as Record<string, unknown>).style, props.style)
    )

    const clampIndex = (next: number) => {
      const max = Math.max(totalCount.value - 1, 0)
      return Math.min(Math.max(next, 0), max)
    }

    const setCurrent = (next: number) => {
      const clamped = clampIndex(next)
      const prev = currentIndex.value
      if (props.current === undefined) {
        innerCurrent.value = clamped
      }
      emit('update:current', clamped)
      emit('change', clamped, prev)
    }

    const runBeforeNext = async (): Promise<boolean> => {
      if (!props.beforeNext || !currentStep.value) {
        return true
      }

      const result = await props.beforeNext(currentIndex.value, currentStep.value, props.steps)
      if (result === true) {
        return true
      }
      return false
    }

    const handlePrev = () => {
      if (currentIndex.value <= 0 || props.steps[currentIndex.value - 1]?.disabled) return
      setCurrent(currentIndex.value - 1)
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
      if (props.steps[currentIndex.value + 1]?.disabled) return
      setCurrent(currentIndex.value + 1)
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
            ? h('div', { class: 'px-6 py-5 bg-[var(--tiger-surface-muted,#f9fafb)]' }, [
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
            { class: 'px-6 py-4 flex flex-col items-center' },
            { default: () => renderContent() }
          ),
          props.showActions
            ? h(
                'div',
                {
                  class:
                    'flex items-center justify-center gap-3 px-6 py-2 border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface-muted,#f9fafb)]'
                },
                [
                  h(
                    Button,
                    {
                      type: 'button',
                      variant: 'secondary',
                      disabled: isFirst,
                      onClick: handlePrev
                    },
                    { default: () => resolveLocaleText(labels.value.prevText, props.prevText) }
                  ),
                  h(
                    Button,
                    {
                      type: 'button',
                      variant: 'primary',
                      onClick: handleNext
                    },
                    {
                      default: () =>
                        isLast
                          ? resolveLocaleText(labels.value.finishText, props.finishText)
                          : resolveLocaleText(labels.value.nextText, props.nextText)
                    }
                  )
                ]
              )
            : null
        ]
      )
    }
  }
})

export default FormWizard

import { defineComponent, computed, ref, watch, h, PropType, type Component } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  type WizardStep,
  type StepsDirection,
  type StepSize,
  type FormWizardValidator
} from '@expcat/tigercat-core'
import { Steps } from './Steps'
import { StepsItem } from './StepsItem'
import { Button } from './Button'
import { Alert } from './Alert'

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
      default: 'Previous'
    },
    nextText: {
      type: String,
      default: 'Next'
    },
    finishText: {
      type: String,
      default: 'Finish'
    },
    beforeNext: {
      type: Function as PropType<FormWizardValidator>,
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
    const innerCurrent = ref(props.current ?? props.defaultCurrent)
    const errorMessage = ref<string | null>(null)

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
        'tiger-form-wizard flex flex-col gap-6 w-full',
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
        errorMessage.value = null
        return true
      }

      const result = await props.beforeNext(currentIndex.value, currentStep.value, props.steps)
      if (result === true) {
        errorMessage.value = null
        return true
      }

      if (typeof result === 'string') {
        errorMessage.value = result
      } else {
        errorMessage.value = null
      }

      return false
    }

    const handlePrev = () => {
      if (currentIndex.value <= 0 || props.steps[currentIndex.value - 1]?.disabled) return
      errorMessage.value = null
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
      errorMessage.value = null
      setCurrent(currentIndex.value + 1)
    }

    const handleStepChange = async (nextIndex: number) => {
      if (nextIndex === currentIndex.value || props.steps[nextIndex]?.disabled) return
      if (nextIndex > currentIndex.value) {
        const ok = await runBeforeNext()
        if (!ok) return
      }
      errorMessage.value = null
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
            ? h(
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
            : null,
          errorMessage.value
            ? h(Alert, {
                type: 'error',
                description: errorMessage.value,
                className: 'tiger-form-wizard-alert'
              })
            : null,
          h(
            'div',
            {
              class:
                'tiger-form-wizard-body rounded-lg border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] p-6'
            },
            {
              default: () => [
                renderContent(),
                props.showActions
                  ? h(
                      'div',
                      {
                        class:
                          'tiger-form-wizard-actions flex items-center justify-between border-t border-[var(--tiger-border,#e5e7eb)] pt-4 mt-6'
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
                          { default: () => props.prevText }
                        ),
                        h(
                          Button,
                          {
                            type: 'button',
                            variant: 'primary',
                            onClick: handleNext
                          },
                          { default: () => (isLast ? props.finishText : props.nextText) }
                        )
                      ]
                    )
                  : null
              ]
            }
          )
        ]
      )
    }
  }
})

export default FormWizard

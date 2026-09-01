import {
  defineComponent,
  computed,
  ref,
  h,
  PropType,
  useId,
  type Component,
  type VNodeChild
} from 'vue'
import {
  canClickWizardStep,
  classNames,
  clampStepIndex,
  coerceClassValue,
  createAsyncLock,
  findNextUnskippedStep,
  getFormWizardActionsClasses,
  getFormWizardBodyClasses,
  getFormWizardHeaderClasses,
  getFormWizardLabels,
  getFormWizardWrapperClasses,
  isLastAvailableStep,
  isStepSkipped,
  mergeStyleValues,
  mergeTigerLocale,
  resolveLocaleText,
  runWizardAdvanceGate,
  type WizardStep,
  type StepsDirection,
  type StepSize,
  type FormWizardValidator,
  type FormWizardProps as CoreFormWizardProps,
  type TigerLocale,
  type TigerLocaleFormWizard
} from '@expcat/tigercat-core'
import { Steps } from './Steps'
import { Button } from './Button'
import { Icon } from './Icon'
import { useTigerConfig } from './ConfigProvider'
import { useFormContext } from './Form'

export type { WizardStep }

export interface VueFormWizardProps extends Omit<CoreFormWizardProps, 'style'> {
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
  setup(props, { slots, attrs, emit, expose }) {
    const config = useTigerConfig()
    const formContext = useFormContext()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getFormWizardLabels(mergedLocale.value, props.labels))
    const innerCurrent = ref(clampStepIndex(props.defaultCurrent ?? 0, props.steps.length))
    const errorMessage = ref<string | undefined>()
    const pending = ref(false)
    const lock = createAsyncLock()
    const titleId = useId()

    const totalCount = computed(() => props.steps.length)
    const currentIndex = computed(() =>
      clampStepIndex(
        props.current !== undefined ? props.current : innerCurrent.value,
        totalCount.value
      )
    )
    const currentStep = computed(() => props.steps[currentIndex.value])
    const isLast = computed(() => isLastAvailableStep(currentIndex.value, props.steps))
    const isFirst = computed(() => {
      if (currentIndex.value <= 0) return true
      return (
        findNextUnskippedStep(currentIndex.value - 1, -1, props.steps, currentIndex.value) ===
        currentIndex.value
      )
    })

    const wrapperClasses = computed(() =>
      getFormWizardWrapperClasses({
        bordered: props.bordered,
        className: classNames(props.className, coerceClassValue(attrs.class))
      })
    )
    const wrapperStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const setCurrent = async (next: number) => {
      const clamped = clampStepIndex(next, totalCount.value)
      const prev = currentIndex.value
      if (props.current === undefined) innerCurrent.value = clamped
      emit('update:current', clamped)
      emit('change', clamped, prev)
      if (props.autoSave && props.steps[clamped]) {
        await props.autoSave(clamped, props.steps[clamped])
      }
    }

    const formApi = () => formContext?.value

    const validateAdvance = () => {
      const form = formApi()
      return runWizardAdvanceGate({
        currentIndex: currentIndex.value,
        currentStep: currentStep.value,
        steps: props.steps,
        beforeNext: props.beforeNext,
        validateFields: form ? (fields) => form.validateFields(fields) : undefined
      })
    }

    const finishAt = async (index: number) => {
      const form = formApi()
      if (form) {
        const fields = props.steps[index]?.fields
        const valid = fields?.length ? await form.validateFields(fields) : await form.validate()
        if (!valid) return
        await form.submit()
      }
      emit('finish', index, props.steps, form?.getValues())
      if (props.autoSave && props.steps[index]) {
        await props.autoSave(index, props.steps[index])
      }
    }

    const handlePrev = () => {
      if (currentIndex.value <= 0) return
      const target = findNextUnskippedStep(
        currentIndex.value - 1,
        -1,
        props.steps,
        currentIndex.value
      )
      if (target === currentIndex.value) return
      errorMessage.value = undefined
      void setCurrent(target)
    }

    const handleNext = async () => {
      if (totalCount.value === 0) return
      await lock.run(async () => {
        pending.value = true
        try {
          const outcome = await validateAdvance()
          if (!outcome.ok) {
            errorMessage.value = outcome.message
            return
          }
          errorMessage.value = undefined
          if (isLast.value) {
            await finishAt(currentIndex.value)
            return
          }
          const target = findNextUnskippedStep(
            currentIndex.value + 1,
            1,
            props.steps,
            currentIndex.value
          )
          if (target === currentIndex.value) return
          await setCurrent(target)
        } finally {
          pending.value = false
        }
      })
    }

    const handleStepChange = (nextIndex: number) => {
      if (!canClickWizardStep(nextIndex, currentIndex.value, props.steps)) return
      errorMessage.value = undefined
      void setCurrent(nextIndex)
    }

    expose({
      next: handleNext,
      prev: handlePrev,
      finish: handleNext
    })

    const renderContent = (): VNodeChild => {
      if (!currentStep.value) return undefined
      if (slots.step) return slots.step({ step: currentStep.value, index: currentIndex.value })
      if (slots.default) {
        return slots.default({ step: currentStep.value, index: currentIndex.value })
      }
      if (currentStep.value.content != null) return currentStep.value.content as VNodeChild
      return undefined
    }

    return () => {
      const stepItems = props.steps.map((step, index) => ({
        key: step.key ?? index,
        title: step.title,
        description: isStepSkipped(step) ? labels.value.skippedText : step.description,
        status: step.status,
        icon: step.icon,
        disabled:
          step.disabled || isStepSkipped(step) || (props.clickable && index > currentIndex.value)
      }))

      const { class: _class, style: _style, ...hostAttrs } = attrs as Record<string, unknown>

      if (totalCount.value === 0) {
        return h('div', {
          ...hostAttrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          'data-tiger-form-wizard': '',
          role: 'group',
          'aria-label': labels.value.ariaLabel
        })
      }

      return h(
        'div',
        {
          ...hostAttrs,
          class: wrapperClasses.value,
          style: wrapperStyle.value,
          'data-tiger-form-wizard': '',
          role: 'group',
          'aria-label': labels.value.ariaLabel
        },
        [
          props.showSteps
            ? h('div', { class: getFormWizardHeaderClasses(props.bordered) }, [
                h(Steps as unknown as Component, {
                  current: currentIndex.value,
                  direction: props.direction,
                  size: props.size,
                  simple: props.simple,
                  clickable: props.clickable,
                  items: stepItems,
                  'onUpdate:current': handleStepChange
                })
              ])
            : undefined,
          h('div', { class: getFormWizardBodyClasses(), 'aria-labelledby': titleId }, [
            h('div', { id: titleId, class: 'sr-only' }, currentStep.value?.title),
            h('div', { class: 'sr-only', 'aria-live': 'polite' }, currentStep.value?.title),
            errorMessage.value
              ? h(
                  'div',
                  {
                    role: 'alert',
                    class: 'mb-3 w-full text-sm text-[var(--tiger-error,#dc2626)]'
                  },
                  errorMessage.value
                )
              : undefined,
            renderContent()
          ]),
          props.showActions
            ? h('div', { class: getFormWizardActionsClasses(props.bordered), role: 'group' }, [
                !isFirst.value
                  ? h(
                      Button,
                      {
                        htmlType: 'button',
                        variant: 'secondary',
                        class: 'group',
                        onClick: handlePrev,
                        disabled: pending.value,
                        size: props.size === 'small' ? 'sm' : 'md'
                      },
                      {
                        icon: () => h(Icon, { name: 'arrow-left', class: 'w-3.5 h-3.5' }),
                        default: () => resolveLocaleText(labels.value.prevText, props.prevText)
                      }
                    )
                  : h('div'),
                h(
                  Button,
                  {
                    htmlType: 'button',
                    variant: 'primary',
                    class: 'group',
                    onClick: handleNext,
                    loading: pending.value,
                    disabled: pending.value,
                    size: props.size === 'small' ? 'sm' : 'md',
                    iconPosition: isLast.value ? 'start' : 'end'
                  },
                  {
                    icon: () =>
                      h(Icon, {
                        name: isLast.value ? 'check' : 'arrow-right',
                        class: 'w-3.5 h-3.5'
                      }),
                    default: () =>
                      isLast.value
                        ? resolveLocaleText(labels.value.finishText, props.finishText)
                        : resolveLocaleText(labels.value.nextText, props.nextText)
                  }
                )
              ])
            : undefined
        ]
      )
    }
  }
})

export default FormWizard

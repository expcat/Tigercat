import React, {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  canClickWizardStep,
  createAsyncLock,
  getFormWizardActionsClasses,
  getFormWizardBodyClasses,
  getFormWizardHeaderClasses,
  getFormWizardLabels,
  getFormWizardWrapperClasses,
  isLastAvailableStep,
  mergeTigerLocale,
  resolveLocaleText,
  runWizardAdvanceGate,
  clampStepIndex,
  findNextUnskippedStep,
  isStepSkipped,
  type FormWizardProps as CoreFormWizardProps,
  type WizardStep
} from '@expcat/tigercat-core'
import { Steps } from './Steps'
import { Button } from './Button'
import { Icon } from './Icon'
import { useTigerConfig } from './ConfigProvider'
import { useFormContext } from './Form'
import { useControlledState } from '../hooks/useControlledState'

export type { WizardStep }

export interface FormWizardHandle {
  next: () => Promise<void>
  prev: () => void
  finish: () => Promise<void>
}

export interface FormWizardProps
  extends
    Omit<CoreFormWizardProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children' | 'style' | 'autoSave'> {
  renderStep?: (step: WizardStep, index: number) => React.ReactNode
  children?: React.ReactNode | ((step: WizardStep, index: number) => React.ReactNode)
  style?: React.CSSProperties
}

export const FormWizard = forwardRef<FormWizardHandle, FormWizardProps>(function FormWizard(
  {
    steps = [],
    current,
    defaultCurrent = 0,
    clickable = false,
    direction = 'horizontal',
    size = 'default',
    simple = false,
    bordered = true,
    showSteps = true,
    showActions = true,
    prevText,
    nextText,
    finishText,
    locale,
    labels: labelsOverride,
    beforeNext,
    autoSave,
    onChange,
    onFinish,
    renderStep,
    children,
    className,
    style,
    ...props
  },
  ref
) {
  const config = useTigerConfig()
  const form = useFormContext()
  const titleId = useId()
  const liveId = useId()
  const [errorMessage, setErrorMessage] = useState<string | undefined>()
  const [pending, setPending] = useState(false)
  const lockRef = useRef(createAsyncLock())
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getFormWizardLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )

  const totalCount = steps.length
  const [currentIndex, setIndex] = useControlledState({
    value: current,
    defaultValue: defaultCurrent,
    onChange: (next, prev?: number) => {
      onChange?.(next, prev ?? next)
    },
    postState: (next) => clampStepIndex(next, totalCount)
  })
  const currentStep = steps[currentIndex]
  const isFirst =
    currentIndex <= 0 ||
    findNextUnskippedStep(currentIndex - 1, -1, steps, currentIndex) === currentIndex
  const isLast = isLastAvailableStep(currentIndex, steps)

  const setCurrent = useCallback(
    async (next: number) => {
      const prev = currentIndex
      setIndex(next, prev)
      if (autoSave && steps[next]) {
        await autoSave(next, steps[next])
      }
    },
    [autoSave, currentIndex, setIndex, steps]
  )

  const validateAdvance = useCallback(
    () =>
      runWizardAdvanceGate({
        currentIndex,
        currentStep,
        steps,
        beforeNext,
        validateFields: form ? (fields) => form.validateFields(fields) : undefined
      }),
    [beforeNext, currentIndex, currentStep, form, steps]
  )

  const handlePrev = useCallback(() => {
    if (currentIndex <= 0) return
    const target = findNextUnskippedStep(currentIndex - 1, -1, steps, currentIndex)
    if (target === currentIndex) return
    setErrorMessage(undefined)
    void setCurrent(target)
  }, [currentIndex, setCurrent, steps])

  const finishAt = useCallback(
    async (index: number) => {
      if (form) {
        const fields = steps[index]?.fields
        const valid = fields?.length ? await form.validateFields(fields) : await form.validate()
        if (!valid) return
        await form.submit()
      }
      onFinish?.(index, steps, form?.getValues())
      if (autoSave && steps[index]) await autoSave(index, steps[index])
    },
    [autoSave, form, onFinish, steps]
  )

  const handleNext = useCallback(async () => {
    if (totalCount === 0) return
    await lockRef.current.run(async () => {
      setPending(true)
      try {
        const outcome = await validateAdvance()
        if (!outcome.ok) {
          setErrorMessage(outcome.message)
          return
        }
        setErrorMessage(undefined)
        if (isLast) {
          await finishAt(currentIndex)
          return
        }
        const target = findNextUnskippedStep(currentIndex + 1, 1, steps, currentIndex)
        if (target === currentIndex) return
        await setCurrent(target)
      } finally {
        setPending(false)
      }
    })
  }, [currentIndex, finishAt, isLast, setCurrent, steps, totalCount, validateAdvance])

  const handleStepChange = useCallback(
    (nextIndex: number) => {
      if (!canClickWizardStep(nextIndex, currentIndex, steps)) return
      setErrorMessage(undefined)
      void setCurrent(nextIndex)
    },
    [currentIndex, setCurrent, steps]
  )

  useImperativeHandle(
    ref,
    () => ({
      next: () => handleNext(),
      prev: handlePrev,
      finish: () => handleNext()
    }),
    [handleNext, handlePrev]
  )

  const contentNode = useMemo(() => {
    if (!currentStep) return null
    if (renderStep) return renderStep(currentStep, currentIndex)
    if (typeof children === 'function') return children(currentStep, currentIndex)
    if (children) return children
    return (currentStep.content as React.ReactNode) ?? null
  }, [children, currentIndex, currentStep, renderStep])

  const stepItems = useMemo(
    () =>
      steps.map((step, index) => ({
        key: step.key ?? index,
        title: step.title,
        description: isStepSkipped(step) ? labels.skippedText : step.description,
        status: step.status,
        icon: step.icon,
        disabled: step.disabled || isStepSkipped(step) || (clickable && index > currentIndex)
      })),
    [clickable, currentIndex, labels.skippedText, steps]
  )

  if (totalCount === 0) {
    return (
      <div
        className={getFormWizardWrapperClasses({ bordered, className })}
        style={style}
        data-tiger-form-wizard
        role="group"
        aria-label={labels.ariaLabel}
        {...props}
      />
    )
  }

  return (
    <div
      className={getFormWizardWrapperClasses({ bordered, className })}
      style={style}
      data-tiger-form-wizard
      role="group"
      aria-label={labels.ariaLabel}
      {...props}>
      {showSteps ? (
        <div className={getFormWizardHeaderClasses(bordered)}>
          <Steps
            current={currentIndex}
            direction={direction}
            size={size}
            simple={simple}
            clickable={clickable}
            items={stepItems}
            onChange={handleStepChange}
          />
        </div>
      ) : null}
      <div className={getFormWizardBodyClasses()} aria-labelledby={titleId}>
        <div id={titleId} className="sr-only">
          {currentStep?.title}
        </div>
        <div id={liveId} className="sr-only" aria-live="polite">
          {currentStep?.title}
        </div>
        {errorMessage ? (
          <div role="alert" className="mb-3 w-full text-sm text-[var(--tiger-error,#dc2626)]">
            {errorMessage}
          </div>
        ) : null}
        {contentNode}
      </div>
      {showActions ? (
        <div className={getFormWizardActionsClasses(bordered)} role="group">
          {!isFirst ? (
            <Button
              htmlType="button"
              variant="secondary"
              className="group"
              onClick={handlePrev}
              disabled={pending}
              size={size === 'small' ? 'sm' : 'md'}
              icon={<Icon name="arrow-left" className="w-3.5 h-3.5" />}>
              {resolveLocaleText(labels.prevText, prevText)}
            </Button>
          ) : (
            <div />
          )}
          <Button
            htmlType="button"
            variant="primary"
            className="group"
            onClick={() => void handleNext()}
            loading={pending}
            disabled={pending}
            size={size === 'small' ? 'sm' : 'md'}
            icon={<Icon name={isLast ? 'check' : 'arrow-right'} className="w-3.5 h-3.5" />}
            iconPosition={isLast ? 'start' : 'end'}>
            {isLast
              ? resolveLocaleText(labels.finishText, finishText)
              : resolveLocaleText(labels.nextText, nextText)}
          </Button>
        </div>
      ) : null}
    </div>
  )
})

FormWizard.displayName = 'TigerFormWizard'

export default FormWizard

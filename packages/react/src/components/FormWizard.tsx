import React, {
  forwardRef,
  useCallback,
  useEffect,
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
  isFormValidationSuperseded,
  isLastAvailableStep,
  mergeTigerLocale,
  resolveLocaleText,
  runWizardAdvanceGate,
  stableModelSnapshot,
  wizardStepIsDirty,
  clampStepIndex,
  findNextUnskippedStep,
  isStepSkipped,
  type FormWizardProps as CoreFormWizardProps,
  type WizardStep
} from '@expcat/tigercat-core'
import { confirmModal } from './Modal'
import { Steps } from './Steps'
import { Button } from './Button'
import { Icon } from './Icon'
import { useTigerConfig } from './tiger-config'
import { useFormContext } from './Form'
import { useControlledState } from '../hooks/useControlledState'

function wizardFormErrorText(
  errors: readonly { message?: string }[] | undefined
): string | undefined {
  if (!errors?.length) return undefined
  const seen = new Set<string>()
  const messages: string[] = []
  for (const error of errors) {
    const message = error.message?.trim()
    if (!message || seen.has(message)) continue
    seen.add(message)
    messages.push(message)
  }
  return messages.length ? messages.join(' ') : undefined
}

export type { WizardStep }

export interface FormWizardHandle {
  next: () => Promise<void>
  prev: () => void
  finish: () => Promise<void>
  requestClose: () => Promise<boolean>
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
    orientation = 'horizontal',
    size = 'md',
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
    model,
    onClose,
    onStepChange,
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
  const [formAlertNonce, setFormAlertNonce] = useState(0)
  const formAlertRequest = useRef(0)
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
  const [currentIndex, setIndex] = useControlledState<
    number,
    [number | undefined, { skippedValidation: boolean }]
  >({
    value: current,
    defaultValue: defaultCurrent,
    onChange: (next, prev, detail) => {
      onStepChange?.(next, prev ?? next, detail ?? { skippedValidation: false })
    },
    postState: (next) => clampStepIndex(next, totalCount)
  })
  const currentStep = steps[currentIndex]
  const isFirst =
    currentIndex <= 0 ||
    findNextUnskippedStep(currentIndex - 1, -1, steps, currentIndex) === currentIndex
  const isLast = isLastAvailableStep(currentIndex, steps)

  const selfStep = useRef(false)
  const snapshot = useRef(stableModelSnapshot(model))
  const confirmLeave = useCallback(async () => {
    if (!wizardStepIsDirty(snapshot.current, model)) return true
    const copy = labels
    try {
      await confirmModal({
        title: copy.leaveStepTitle,
        content: copy.leaveStepMessage,
        okText: copy.leaveText,
        cancelText: copy.stayText
      })
      return true
    } catch {
      return false
    }
  }, [labels, model])
  const setCurrent = useCallback(
    async (next: number) => {
      const prev = currentIndex
      if (next === prev) return
      if (autoSave && steps[next]) {
        try {
          await autoSave(next, steps[next])
        } catch {
          return
        }
      }
      selfStep.current = true
      setIndex(next, prev, { skippedValidation: false })
      snapshot.current = stableModelSnapshot(model)
    },
    [autoSave, currentIndex, model, setIndex, steps]
  )

  const seenCurrent = useRef(current)
  useEffect(() => {
    if (current === undefined) return
    if (Object.is(current, seenCurrent.current)) return
    const prev = seenCurrent.current
    seenCurrent.current = current
    if (selfStep.current) {
      selfStep.current = false
      return
    }
    if (prev !== undefined) {
      onStepChange?.(clampStepIndex(current, totalCount), clampStepIndex(prev, totalCount), {
        skippedValidation: true
      })
    }
    snapshot.current = stableModelSnapshot(model)
  }, [current, model, onStepChange, totalCount])

  useEffect(() => {
    if (formAlertNonce === 0) return
    const message = wizardFormErrorText(form?.errors)
    if (!message) return
    setErrorMessage(message)
  }, [form, formAlertNonce])

  const validateAdvance = useCallback(
    () =>
      runWizardAdvanceGate({
        currentIndex,
        currentStep,
        steps,
        beforeNext,
        validateFields: form ? (fields) => form.validateFields(fields) : undefined,
        mountedFields: form?.getMountedFieldNames()
      }),
    [beforeNext, currentIndex, currentStep, form, steps]
  )

  const handlePrev = useCallback(() => {
    void (async () => {
      if (!(await confirmLeave())) return
      if (currentIndex <= 0) return
      const target = findNextUnskippedStep(currentIndex - 1, -1, steps, currentIndex)
      if (target === currentIndex) return
      setErrorMessage(undefined)
      void setCurrent(target)
    })()
  }, [confirmLeave, currentIndex, setCurrent, steps])

  const requestFormAlert = useCallback(() => {
    formAlertRequest.current += 1
    setFormAlertNonce(formAlertRequest.current)
  }, [])

  const finishAt = useCallback(
    async (index: number) => {
      if (form) {
        const fields = steps[index]?.fields
        const names = fields?.length ? fields : form.getMountedFieldNames()
        if (names.length === 0) {
          try {
            if (!(await form.validate())) {
              requestFormAlert()
              return
            }
          } catch (error) {
            if (isFormValidationSuperseded(error)) return
            throw error
          }
        }
        const submitted = await form.submit()
        if (!submitted) {
          requestFormAlert()
          return
        }
      }
      if (autoSave && steps[index]) {
        try {
          await autoSave(index, steps[index])
        } catch {
          return
        }
      }
      onFinish?.(index, steps, form?.getValues())
    },
    [autoSave, form, onFinish, requestFormAlert, steps]
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
      void (async () => {
        if (!canClickWizardStep(nextIndex, currentIndex, steps)) return
        if (nextIndex < currentIndex && !(await confirmLeave())) return
        setErrorMessage(undefined)
        void setCurrent(nextIndex)
      })()
    },
    [confirmLeave, currentIndex, setCurrent, steps]
  )

  useImperativeHandle(
    ref,
    () => ({
      next: () => handleNext(),
      prev: handlePrev,
      requestClose: async () => {
        if (!(await confirmLeave())) return false
        onClose?.()
        return true
      },
      finish: async () => {
        if (!isLast) return
        await handleNext()
      }
    }),
    [confirmLeave, handleNext, handlePrev, isLast, onClose]
  )

  const contentNode = useMemo(() => {
    if (!currentStep) return null
    if (typeof children === 'function') return children(currentStep, currentIndex)
    if (renderStep) return renderStep(currentStep, currentIndex)
    return children ?? (currentStep.content as React.ReactNode) ?? null
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

  const callerLabel = props['aria-label']
  const ariaLabel =
    typeof callerLabel === 'string' && callerLabel.length > 0 ? callerLabel : labels.ariaLabel

  if (totalCount === 0) {
    return (
      <div
        className={getFormWizardWrapperClasses({ bordered, className })}
        style={style}
        data-tiger-form-wizard
        {...props}
        role="group"
        aria-label={ariaLabel}
      />
    )
  }

  return (
    <div
      className={getFormWizardWrapperClasses({ bordered, className })}
      style={style}
      data-tiger-form-wizard
      {...props}
      role="group"
      aria-label={ariaLabel}>
      {showSteps ? (
        <div className={getFormWizardHeaderClasses(bordered)}>
          <Steps
            current={currentIndex}
            orientation={orientation}
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
          <div role="alert" className="mb-3 w-full text-sm text-[var(--tiger-error)]">
            {errorMessage}
          </div>
        ) : null}
        {contentNode}
      </div>
      {showActions ? (
        <div className={getFormWizardActionsClasses(bordered)} role="group">
          {!isFirst ? (
            <Button
              type="button"
              variant="secondary"
              className="group"
              onClick={handlePrev}
              disabled={pending}
              size={size}
              icon={<Icon name="arrow-left" size="sm" />}>
              {resolveLocaleText(labels.prevText, prevText)}
            </Button>
          ) : (
            <div />
          )}
          <Button
            type="button"
            variant="primary"
            className="group"
            onClick={() => void handleNext()}
            loading={pending}
            disabled={pending}
            size={size}
            icon={<Icon name={isLast ? 'check' : 'arrow-right'} size="sm" />}
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

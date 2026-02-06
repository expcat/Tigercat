import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  classNames,
  type FormWizardProps as CoreFormWizardProps,
  type WizardStep
} from '@expcat/tigercat-core'
import { Steps } from './Steps'
import { StepsItem } from './StepsItem'
import { Button } from './Button'
import { Alert } from './Alert'

export interface FormWizardProps
  extends
    Omit<CoreFormWizardProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children' | 'style'> {
  renderStep?: (step: WizardStep, index: number) => React.ReactNode
  style?: React.CSSProperties
}

export const FormWizard: React.FC<FormWizardProps> = ({
  steps = [],
  current,
  defaultCurrent = 0,
  clickable = false,
  direction = 'horizontal',
  size = 'default',
  simple = false,
  showSteps = true,
  showActions = true,
  prevText = 'Previous',
  nextText = 'Next',
  finishText = 'Finish',
  beforeNext,
  onChange,
  onFinish,
  renderStep,
  className,
  style,
  ...props
}) => {
  const [innerCurrent, setInnerCurrent] = useState(defaultCurrent)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (current !== undefined) setInnerCurrent(current)
  }, [current])

  const totalCount = steps.length
  const currentIndex = current ?? innerCurrent
  const currentStep = steps[currentIndex]
  const isFirst = currentIndex <= 0
  const isLast = currentIndex >= totalCount - 1

  const wrapperClasses = classNames('tiger-form-wizard flex flex-col gap-6 w-full', className)

  const setCurrent = useCallback(
    (next: number) => {
      const max = Math.max(totalCount - 1, 0)
      const clamped = Math.min(Math.max(next, 0), max)
      if (current === undefined) {
        setInnerCurrent(clamped)
      }
      onChange?.(clamped, currentIndex)
    },
    [current, currentIndex, onChange, totalCount]
  )

  const runBeforeNext = useCallback(async (): Promise<boolean> => {
    if (!beforeNext || !currentStep) {
      setErrorMessage(null)
      return true
    }

    const result = await beforeNext(currentIndex, currentStep, steps)
    if (result === true) {
      setErrorMessage(null)
      return true
    }

    if (typeof result === 'string') {
      setErrorMessage(result)
    } else {
      setErrorMessage(null)
    }

    return false
  }, [beforeNext, currentIndex, currentStep, steps])

  const handlePrev = useCallback(() => {
    if (currentIndex <= 0 || steps[currentIndex - 1]?.disabled) return
    setErrorMessage(null)
    setCurrent(currentIndex - 1)
  }, [currentIndex, setCurrent, steps])

  const handleNext = useCallback(async () => {
    if (totalCount === 0) return
    const ok = await runBeforeNext()
    if (!ok) return
    if (isLast) {
      onFinish?.(currentIndex, steps)
      return
    }
    if (steps[currentIndex + 1]?.disabled) return
    setErrorMessage(null)
    setCurrent(currentIndex + 1)
  }, [currentIndex, totalCount, isLast, onFinish, runBeforeNext, setCurrent, steps])

  const handleStepChange = useCallback(
    async (nextIndex: number) => {
      if (nextIndex === currentIndex || steps[nextIndex]?.disabled) return
      if (nextIndex > currentIndex) {
        const ok = await runBeforeNext()
        if (!ok) return
      }
      setErrorMessage(null)
      setCurrent(nextIndex)
    },
    [currentIndex, runBeforeNext, setCurrent, steps]
  )

  const contentNode = useMemo(() => {
    if (!currentStep) return null
    if (renderStep) return renderStep(currentStep, currentIndex)
    return (currentStep.content as React.ReactNode) ?? null
  }, [currentIndex, currentStep, renderStep])

  const stepsNodes = useMemo(
    () =>
      steps.map((step, index) => (
        <StepsItem
          key={step.key ?? index}
          title={step.title}
          description={step.description}
          status={step.status}
          icon={step.icon as React.ReactNode}
          disabled={step.disabled}
        />
      )),
    [steps]
  )

  return (
    <div className={wrapperClasses} style={style} data-tiger-form-wizard {...props}>
      {showSteps && steps.length > 0 && (
        <Steps
          current={currentIndex}
          direction={direction}
          size={size}
          simple={simple}
          clickable={clickable}
          onChange={handleStepChange}>
          {stepsNodes}
        </Steps>
      )}
      {errorMessage && (
        <Alert type="error" description={errorMessage} className="tiger-form-wizard-alert" />
      )}
      <div className="tiger-form-wizard-body rounded-lg border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] p-6">
        {contentNode}
        {showActions && (
          <div className="tiger-form-wizard-actions flex items-center justify-between border-t border-[var(--tiger-border,#e5e7eb)] pt-4 mt-6">
            <Button type="button" variant="secondary" disabled={isFirst} onClick={handlePrev}>
              {prevText}
            </Button>
            <Button type="button" variant="primary" onClick={handleNext}>
              {isLast ? finishText : nextText}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default FormWizard

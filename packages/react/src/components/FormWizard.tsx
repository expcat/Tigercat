import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  classNames,
  type FormWizardProps as CoreFormWizardProps,
  type WizardStep
} from '@expcat/tigercat-core'
import { Steps } from './Steps'
import { StepsItem } from './StepsItem'
import { Card } from './Card'
import { Button } from './Button'
import { Alert } from './Alert'

export interface FormWizardProps
  extends
    CoreFormWizardProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  renderStep?: (step: WizardStep, index: number) => React.ReactNode
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
    if (current !== undefined) {
      setInnerCurrent(current)
    }
  }, [current])

  const totalCount = steps.length
  const currentIndex = current ?? innerCurrent
  const currentStep = steps[currentIndex]

  const wrapperClasses = useMemo(
    () =>
      classNames(
        'tiger-form-wizard',
        'flex',
        'flex-col',
        'gap-4',
        'w-full',
        className
      ),
    [className]
  )

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
    if (currentIndex <= 0) {
      return
    }

    const prevIndex = currentIndex - 1
    if (steps[prevIndex]?.disabled) {
      return
    }

    setErrorMessage(null)
    setCurrent(prevIndex)
  }, [currentIndex, setCurrent, steps])

  const handleNext = useCallback(async () => {
    if (totalCount === 0) {
      return
    }

    const isLast = currentIndex >= totalCount - 1
    const ok = await runBeforeNext()
    if (!ok) {
      return
    }

    if (isLast) {
      onFinish?.(currentIndex, steps)
      return
    }

    const nextIndex = currentIndex + 1
    if (steps[nextIndex]?.disabled) {
      return
    }

    setErrorMessage(null)
    setCurrent(nextIndex)
  }, [currentIndex, totalCount, onFinish, runBeforeNext, setCurrent, steps])

  const handleStepChange = useCallback(
    async (nextIndex: number) => {
      if (nextIndex === currentIndex) {
        return
      }

      if (steps[nextIndex]?.disabled) {
        return
      }

      if (nextIndex > currentIndex) {
        const ok = await runBeforeNext()
        if (!ok) {
          return
        }
      }

      setErrorMessage(null)
      setCurrent(nextIndex)
    },
    [currentIndex, runBeforeNext, setCurrent, steps]
  )

  const contentNode = useMemo(() => {
    if (!currentStep) {
      return null
    }

    if (renderStep) {
      return renderStep(currentStep, currentIndex)
    }

    if (currentStep.content != null) {
      return currentStep.content as React.ReactNode
    }

    return null
  }, [currentIndex, currentStep, renderStep])

  const stepsNodes = useMemo(
    () =>
      steps.map((step, index) => (
        <StepsItem
          key={step.key ?? index}
          title={step.title}
          description={step.description}
          status={step.status}
          icon={step.icon}
          disabled={step.disabled}
        />
      )),
    [steps]
  )

  const isFirst = currentIndex <= 0
  const isLast = currentIndex >= totalCount - 1

  return (
    <div className={wrapperClasses} style={style} data-tiger-form-wizard {...props}>
      {showSteps && steps.length > 0 ? (
        <Steps
          current={currentIndex}
          direction={direction}
          size={size}
          simple={simple}
          clickable={clickable}
          onChange={handleStepChange}>
          {stepsNodes}
        </Steps>
      ) : null}
      {errorMessage ? (
        <Alert type="error" description={errorMessage} className="tiger-form-wizard-alert" />
      ) : null}
      <Card
        className="tiger-form-wizard-card"
        actions={
          showActions ? (
            <div className="flex items-center justify-between gap-3">
              <Button type="button" variant="secondary" disabled={isFirst} onClick={handlePrev}>
                {prevText}
              </Button>
              <Button type="button" variant="primary" onClick={handleNext}>
                {isLast ? finishText : nextText}
              </Button>
            </div>
          ) : undefined
        }>
        {contentNode}
      </Card>
    </div>
  )
}

export default FormWizard

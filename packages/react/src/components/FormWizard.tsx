import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  classNames,
  getFormWizardLabels,
  mergeTigerLocale,
  resolveLocaleText,
  type FormWizardProps as CoreFormWizardProps,
  type WizardStep
} from '@expcat/tigercat-core'
import { Steps } from './Steps'
import { StepsItem } from './StepsItem'
import { Button } from './Button'
import { useTigerConfig } from './ConfigProvider'

export interface FormWizardProps
  extends
    Omit<CoreFormWizardProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children' | 'style' | 'autoSave'> {
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
  prevText,
  nextText,
  finishText,
  locale,
  beforeNext,
  autoSave,
  onChange,
  onFinish,
  renderStep,
  className,
  style,
  ...props
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(() => getFormWizardLabels(mergedLocale), [mergedLocale])

  const [innerCurrent, setInnerCurrent] = useState(defaultCurrent)

  useEffect(() => {
    if (current !== undefined) setInnerCurrent(current)
  }, [current])

  const totalCount = steps.length
  const currentIndex = current ?? innerCurrent
  const currentStep = steps[currentIndex]
  const isFirst = currentIndex <= 0
  const isLast = currentIndex >= totalCount - 1

  const wrapperClasses = classNames(
    'tiger-form-wizard w-full rounded-lg border border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface,#ffffff)] shadow-sm overflow-hidden',
    className
  )

  const setCurrent = useCallback(
    (next: number) => {
      const max = Math.max(totalCount - 1, 0)
      const clamped = Math.min(Math.max(next, 0), max)
      if (current === undefined) {
        setInnerCurrent(clamped)
      }
      onChange?.(clamped, currentIndex)
      if (autoSave && steps[clamped]) {
        autoSave(clamped, steps[clamped])
      }
    },
    [current, currentIndex, onChange, totalCount, autoSave, steps]
  )

  const runBeforeNext = useCallback(async (): Promise<boolean> => {
    if (!beforeNext || !currentStep) {
      return true
    }

    const result = await beforeNext(currentIndex, currentStep, steps)
    return result === true
  }, [beforeNext, currentIndex, currentStep, steps])

  const findNextUnskipped = useCallback(
    (from: number, dir: 1 | -1): number => {
      let idx = from
      while (idx >= 0 && idx < totalCount) {
        const step = steps[idx]
        if (!step?.disabled && !step?.skipCondition?.()) return idx
        idx += dir
      }
      // No valid step found — return current index to signal "no move"
      return currentIndex
    },
    [steps, totalCount, currentIndex]
  )

  const handlePrev = useCallback(() => {
    if (currentIndex <= 0) return
    const target = findNextUnskipped(currentIndex - 1, -1)
    if (target === currentIndex) return
    setCurrent(target)
  }, [currentIndex, setCurrent, findNextUnskipped])

  const handleNext = useCallback(async () => {
    if (totalCount === 0) return
    const ok = await runBeforeNext()
    if (!ok) return
    if (isLast) {
      onFinish?.(currentIndex, steps)
      return
    }
    const target = findNextUnskipped(currentIndex + 1, 1)
    if (target === currentIndex) return
    setCurrent(target)
  }, [
    currentIndex,
    totalCount,
    isLast,
    onFinish,
    runBeforeNext,
    setCurrent,
    steps,
    findNextUnskipped
  ])

  const handleStepChange = useCallback(
    async (nextIndex: number) => {
      if (nextIndex === currentIndex || steps[nextIndex]?.disabled) return
      if (nextIndex > currentIndex) {
        const ok = await runBeforeNext()
        if (!ok) return
      }
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
        <div className="px-6 py-5 bg-[var(--tiger-surface-muted,#f9fafb)]">
          <Steps
            current={currentIndex}
            direction={direction}
            size={size}
            simple={simple}
            clickable={clickable}
            onChange={handleStepChange}>
            {stepsNodes}
          </Steps>
        </div>
      )}
      <div className="px-6 py-4 flex flex-col items-center">{contentNode}</div>
      {showActions && (
        <div className="flex items-center justify-center gap-3 px-6 py-2 border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface-muted,#f9fafb)]">
          <Button htmlType="button" variant="secondary" disabled={isFirst} onClick={handlePrev}>
            {resolveLocaleText(labels.prevText, prevText)}
          </Button>
          <Button htmlType="button" variant="primary" onClick={handleNext}>
            {isLast
              ? resolveLocaleText(labels.finishText, finishText)
              : resolveLocaleText(labels.nextText, nextText)}
          </Button>
        </div>
      )}
    </div>
  )
}

export default FormWizard

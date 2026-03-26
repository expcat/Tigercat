import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import ReactDOM from 'react-dom'
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
  closeIconPathD,
  type TourProps as CoreTourProps,
  type TourPlacement,
  type TourRect
} from '@expcat/tigercat-core'
import { StatusIcon } from './shared/icons'

export interface TourProps extends CoreTourProps {
  /** Callback when close button is clicked or tour finishes */
  onClose?: () => void
  /** Callback when tour finishes (last step "Next") */
  onFinish?: () => void
  /** Callback when current step changes */
  onChange?: (current: number) => void
}

export const Tour: React.FC<TourProps> = ({
  steps,
  open = false,
  current: controlledCurrent,
  nextText = 'Next',
  prevText = 'Previous',
  finishText = 'Finish',
  closable = true,
  showIndicators = true,
  className,
  onClose,
  onFinish,
  onChange
}) => {
  const [internalStep, setInternalStep] = useState(0)
  const currentStep = controlledCurrent ?? internalStep
  const step = steps[currentStep]
  const [targetRect, setTargetRect] = useState<TourRect | undefined>()
  const popoverRef = useRef<HTMLDivElement>(null)

  const updateRect = useCallback(() => {
    if (step?.target) {
      setTargetRect(getTourTargetRect(step.target))
    } else {
      setTargetRect(undefined)
    }
  }, [step])

  useEffect(() => {
    if (open) updateRect()
  }, [open, currentStep, updateRect])

  useEffect(() => {
    if (!open) return
    const handler = () => updateRect()
    window.addEventListener('resize', handler)
    window.addEventListener('scroll', handler, true)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('scroll', handler, true)
    }
  }, [open, updateRect])

  const goTo = useCallback(
    (idx: number) => {
      setInternalStep(idx)
      onChange?.(idx)
    },
    [onChange]
  )

  const next = useCallback(() => {
    if (currentStep < steps.length - 1) {
      goTo(currentStep + 1)
    } else {
      onFinish?.()
      onClose?.()
    }
  }, [currentStep, steps.length, goTo, onFinish, onClose])

  const prev = useCallback(() => {
    if (currentStep > 0) goTo(currentStep - 1)
  }, [currentStep, goTo])

  const close = useCallback(() => {
    onClose?.()
  }, [onClose])

  if (!open || !step) return null
  if (typeof document === 'undefined') return null

  const placement: TourPlacement = step.placement ?? 'bottom'
  const showMask = step.mask !== false
  const isLast = currentStep === steps.length - 1
  const isFirst = currentStep === 0

  let popoverStyle: React.CSSProperties
  if (targetRect) {
    const pos = getTourPopoverPosition(targetRect, 320, 160, placement)
    popoverStyle = { position: 'absolute', top: pos.top, left: pos.left }
  } else {
    popoverStyle = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)'
    }
  }

  const content = (
    <>
      {/* Spotlight / mask */}
      {showMask && targetRect && (
        <div style={getTourSpotlightStyle(targetRect) as React.CSSProperties} aria-hidden="true" />
      )}
      {showMask && !targetRect && (
        <div className="fixed inset-0 z-[1000] bg-black/45" aria-hidden="true" onClick={close} />
      )}

      {/* Popover */}
      <div
        ref={popoverRef}
        className={classNames(tourPopoverClasses, className)}
        style={popoverStyle}
        role="dialog"
        aria-modal="true">
        {closable && (
          <button
            className={tourCloseButtonClasses}
            type="button"
            aria-label="Close tour"
            onClick={close}>
            <StatusIcon path={closeIconPathD} className="h-4 w-4" />
          </button>
        )}

        {step.title && <div className={tourTitleClasses}>{step.title}</div>}
        {step.description && <div className={tourDescriptionClasses}>{step.description}</div>}

        <div className={tourFooterClasses}>
          {showIndicators && (
            <span className={tourIndicatorClasses}>
              {currentStep + 1} / {steps.length}
            </span>
          )}
          <div className="flex items-center">
            {!isFirst && (
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md border border-[var(--tiger-border,#e5e7eb)] text-[var(--tiger-text,#111827)] hover:bg-[var(--tiger-surface-muted,#f9fafb)] transition-colors mr-2"
                onClick={prev}>
                {prevText}
              </button>
            )}
            <button
              type="button"
              className="px-3 py-1.5 text-sm rounded-md bg-[var(--tiger-primary,#2563eb)] text-white hover:bg-[var(--tiger-primary-hover,#1d4ed8)] transition-colors"
              onClick={next}>
              {isLast ? finishText : nextText}
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return ReactDOM.createPortal(content, document.body)
}

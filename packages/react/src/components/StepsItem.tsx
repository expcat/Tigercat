import React, { useMemo } from 'react'
import {
  getStepItemClasses,
  getStepIconClasses,
  getStepTailClasses,
  getStepContentClasses,
  getStepTitleClasses,
  getStepDescriptionClasses,
  calculateStepStatus,
  type StepStatus,
} from '@tigercat/core'
import { useStepsContext } from './Steps'

export interface StepsItemProps {
  /**
   * Step title
   */
  title: string

  /**
   * Step description
   */
  description?: string

  /**
   * Step icon (custom icon element)
   */
  icon?: React.ReactNode

  /**
   * Step status (overrides automatic status)
   */
  status?: StepStatus

  /**
   * Whether the step is disabled
   */
  disabled?: boolean

  /**
   * Internal prop: step index (automatically set by parent)
   */
  stepIndex?: number

  /**
   * Internal prop: is last step (automatically set by parent)
   */
  isLast?: boolean
}

export const StepsItem: React.FC<StepsItemProps> = ({
  title,
  description,
  icon,
  status: customStatus,
  disabled = false,
  stepIndex = 0,
  isLast = false,
}) => {
  // Get steps context
  const stepsContext = useStepsContext() || {
    current: 0,
    status: 'process' as StepStatus,
    direction: 'horizontal' as const,
    size: 'default' as const,
    simple: false,
    clickable: false,
  }

  // Calculate step status
  const stepStatus = useMemo(() => {
    return calculateStepStatus(
      stepIndex,
      stepsContext.current,
      stepsContext.status,
      customStatus
    )
  }, [stepIndex, stepsContext.current, stepsContext.status, customStatus])

  // Item classes
  const itemClasses = useMemo(() => {
    return getStepItemClasses(
      stepsContext.direction,
      isLast,
      stepsContext.simple
    )
  }, [stepsContext.direction, isLast, stepsContext.simple])

  // Icon classes
  const iconClasses = useMemo(() => {
    const hasCustomIcon = !!icon
    return getStepIconClasses(
      stepStatus,
      stepsContext.size,
      stepsContext.simple,
      hasCustomIcon
    )
  }, [stepStatus, stepsContext.size, stepsContext.simple, icon])

  // Tail classes
  const tailClasses = useMemo(() => {
    return getStepTailClasses(
      stepsContext.direction,
      stepStatus,
      isLast
    )
  }, [stepsContext.direction, stepStatus, isLast])

  // Content classes
  const contentClasses = useMemo(() => {
    return getStepContentClasses(
      stepsContext.direction,
      stepsContext.simple
    )
  }, [stepsContext.direction, stepsContext.simple])

  // Title classes
  const titleClasses = useMemo(() => {
    return getStepTitleClasses(
      stepStatus,
      stepsContext.size,
      stepsContext.clickable && !disabled
    )
  }, [stepStatus, stepsContext.size, stepsContext.clickable, disabled])

  // Description classes
  const descriptionClasses = useMemo(() => {
    return getStepDescriptionClasses(stepStatus, stepsContext.size)
  }, [stepStatus, stepsContext.size])

  // Handle click
  const handleClick = () => {
    if (disabled || !stepsContext.handleStepClick) {
      return
    }
    stepsContext.handleStepClick(stepIndex)
  }

  // Render icon
  const renderIcon = () => {
    // Custom icon from prop
    if (icon) {
      return <div className={iconClasses}>{icon}</div>
    }

    // Default: show step number or checkmark for finished steps
    if (stepStatus === 'finish') {
      return (
        <div className={iconClasses}>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )
    }

    // Default: show step number
    return <div className={iconClasses}>{stepIndex + 1}</div>
  }

  // Render content
  const renderContent = () => {
    return (
      <div className={contentClasses}>
        <div className={titleClasses} onClick={handleClick}>
          {title}
        </div>
        {!stepsContext.simple && description && (
          <div className={descriptionClasses}>{description}</div>
        )}
      </div>
    )
  }

  // For vertical layout
  if (stepsContext.direction === 'vertical') {
    return (
      <div className={itemClasses}>
        {/* Icon and tail wrapper */}
        <div className="relative">
          {renderIcon()}
          <div className={tailClasses} />
        </div>
        {/* Content */}
        {renderContent()}
      </div>
    )
  }

  // For horizontal layout
  return (
    <div className={itemClasses}>
      {/* Icon */}
      {renderIcon()}
      {/* Tail (connector) */}
      <div className={tailClasses} />
      {/* Content */}
      {renderContent()}
    </div>
  )
}

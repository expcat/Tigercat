import React from 'react'
import {
  classNames,
  getStepItemClasses,
  getStepIconClasses,
  getStepTailClasses,
  getStepContentClasses,
  getStepTitleClasses,
  getStepDescriptionClasses,
  calculateStepStatus,
  stepFinishChar,
  type StepStatus
} from '@expcat/tigercat-core'
import { useStepsContext } from './Steps'

export interface StepsItemProps extends Omit<
  React.LiHTMLAttributes<HTMLLIElement>,
  'title' | 'children'
> {
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
  className,
  style,
  ...props
}) => {
  // Get steps context
  const stepsContext = useStepsContext() || {
    current: 0,
    status: 'process' as StepStatus,
    direction: 'horizontal' as const,
    size: 'default' as const,
    simple: false,
    clickable: false
  }

  const stepStatus = calculateStepStatus(
    stepIndex,
    stepsContext.current,
    stepsContext.status,
    customStatus
  )

  const isClickable = !!stepsContext.handleStepClick && !disabled

  const itemClasses = classNames(
    getStepItemClasses(stepsContext.direction, isLast, stepsContext.simple),
    className
  )

  const iconClasses = getStepIconClasses(stepStatus, stepsContext.size, stepsContext.simple, !!icon)

  const tailClasses = getStepTailClasses(stepsContext.direction, stepStatus, isLast)
  const contentClasses = getStepContentClasses(stepsContext.direction, stepsContext.simple)
  const titleClasses = getStepTitleClasses(stepStatus, stepsContext.size, isClickable)
  const descriptionClasses = getStepDescriptionClasses(stepStatus, stepsContext.size)

  const handleClick = (_event: React.MouseEvent) => {
    if (!isClickable) {
      return
    }
    stepsContext.handleStepClick?.(stepIndex)
  }

  // Render icon
  const renderIcon = () => {
    if (icon) {
      return <div className={iconClasses}>{icon}</div>
    }

    if (stepStatus === 'finish') {
      return (
        <div className={iconClasses} aria-hidden="true">
          {stepFinishChar}
        </div>
      )
    }

    return <div className={iconClasses}>{stepIndex + 1}</div>
  }

  // Render content
  const renderContent = () => {
    return (
      <div className={contentClasses}>
        {stepsContext.clickable ? (
          <button
            type="button"
            className={titleClasses}
            onClick={handleClick}
            disabled={!isClickable}
            aria-disabled={disabled || undefined}>
            {title}
          </button>
        ) : (
          <div className={titleClasses}>{title}</div>
        )}
        {!stepsContext.simple && description && (
          <div className={descriptionClasses}>{description}</div>
        )}
      </div>
    )
  }

  // For vertical layout
  if (stepsContext.direction === 'vertical') {
    return (
      <li
        {...props}
        className={itemClasses}
        style={style as React.CSSProperties}
        aria-current={stepIndex === stepsContext.current ? 'step' : undefined}
        aria-disabled={disabled || undefined}>
        {/* Icon and tail wrapper */}
        <div className="relative">
          {renderIcon()}
          <div className={tailClasses} />
        </div>
        {/* Content */}
        {renderContent()}
      </li>
    )
  }

  // For horizontal layout
  return (
    <li
      {...props}
      className={itemClasses}
      style={style as React.CSSProperties}
      aria-current={stepIndex === stepsContext.current ? 'step' : undefined}
      aria-disabled={disabled || undefined}>
      {/* Icon */}
      {renderIcon()}
      {/* Tail (connector) */}
      <div className={tailClasses} />
      {/* Content */}
      {renderContent()}
    </li>
  )
}

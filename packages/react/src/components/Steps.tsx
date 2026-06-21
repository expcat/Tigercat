import React, { createContext, useContext, useMemo, useCallback, ReactElement } from 'react'
import {
  classNames,
  getStepContentClasses,
  getStepDescriptionClasses,
  getStepIconClasses,
  getStepItemClasses,
  getStepTailClasses,
  getStepTitleClasses,
  getStepsContainerClasses,
  calculateStepStatus,
  type StepsDirection,
  type StepStatus,
  type StepSize,
  type StepsProps as CoreStepsProps
} from '@expcat/tigercat-core'

// Steps context interface
export interface StepsContextValue {
  current: number
  status: StepStatus
  direction: StepsDirection
  size: StepSize
  simple: boolean
  clickable: boolean
  handleStepClick?: (index: number) => void
}

// Create steps context
const StepsContext = createContext<StepsContextValue | null>(null)

// Hook to use steps context
export function useStepsContext(): StepsContextValue | null {
  return useContext(StepsContext)
}

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

  const itemClasses = classNames(getStepItemClasses(stepsContext.direction, isLast), className)

  const iconClasses = getStepIconClasses(stepStatus, stepsContext.size, stepsContext.simple, !!icon)

  const tailClasses = getStepTailClasses(
    stepsContext.direction,
    stepStatus,
    isLast,
    stepsContext.size,
    stepsContext.simple
  )
  const contentClasses = getStepContentClasses(stepsContext.direction)
  const titleClasses = getStepTitleClasses(stepStatus, stepsContext.size, isClickable)
  const descriptionClasses = getStepDescriptionClasses(stepStatus, stepsContext.size)

  const handleClick = () => {
    if (!isClickable) return
    stepsContext.handleStepClick?.(stepIndex)
  }

  const renderIcon = () => {
    if (icon) {
      return <div className={iconClasses}>{icon}</div>
    }

    if (stepStatus === 'finish') {
      return (
        <div className={iconClasses} aria-hidden="true">
          <svg
            className="w-4 h-4 shrink-0 transition-transform duration-300 animate-fade-in"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
      )
    }

    return <div className={iconClasses}>{stepIndex + 1}</div>
  }

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

  if (stepsContext.direction === 'vertical') {
    return (
      <li
        {...props}
        className={itemClasses}
        style={style as React.CSSProperties}
        aria-current={stepIndex === stepsContext.current ? 'step' : undefined}
        aria-disabled={disabled || undefined}>
        <div className="relative">
          {renderIcon()}
          <div className={tailClasses} />
        </div>
        {renderContent()}
      </li>
    )
  }

  return (
    <li
      {...props}
      className={itemClasses}
      style={style as React.CSSProperties}
      aria-current={stepIndex === stepsContext.current ? 'step' : undefined}
      aria-disabled={disabled || undefined}>
      {renderIcon()}
      <div className={tailClasses} />
      {renderContent()}
    </li>
  )
}

export interface StepsProps
  extends
    CoreStepsProps,
    Omit<React.OlHTMLAttributes<HTMLOListElement>, keyof CoreStepsProps | 'onChange' | 'children'> {
  /**
   * Step change event handler
   */
  onChange?: (current: number) => void

  /**
   * Whether steps are clickable
   * @default false
   */
  clickable?: boolean

  /**
   * Step items
   */
  children?: React.ReactNode
}

export const Steps: React.FC<StepsProps> = ({
  current = 0,
  status = 'process',
  direction = 'horizontal',
  size = 'default',
  simple = false,
  clickable = false,
  className,
  style,
  onChange,
  children,
  ...props
}) => {
  const containerClasses = useMemo(
    () => classNames(getStepsContainerClasses(direction), className),
    [direction, className]
  )

  const handleStepClick = useCallback(
    (index: number) => {
      if (!clickable) return
      onChange?.(index)
    },
    [clickable, onChange]
  )

  const contextValue = useMemo<StepsContextValue>(
    () => ({
      current,
      status,
      direction,
      size,
      simple,
      clickable,
      handleStepClick: clickable ? handleStepClick : undefined
    }),
    [current, status, direction, size, simple, clickable, handleStepClick]
  )

  const totalCount = React.Children.count(children)
  const stepsWithProps = React.Children.map(children, (child, index) => {
    if (React.isValidElement<StepsItemProps>(child) && child.type === StepsItem) {
      return React.cloneElement(child, {
        stepIndex: index,
        isLast: index === totalCount - 1
      })
    }
    return child as ReactElement
  })

  return (
    <StepsContext.Provider value={contextValue}>
      <ol {...props} className={containerClasses} style={style}>
        {stepsWithProps}
      </ol>
    </StepsContext.Provider>
  )
}

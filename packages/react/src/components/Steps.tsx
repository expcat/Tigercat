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
  clampStepCurrent,
  getStepStatusText,
  isStepsItemType,
  mergeTigerLocale,
  getStepsLabels,
  stepFinishIconViewBox,
  stepFinishIconStrokeWidth,
  stepFinishIconPathD,
  type StepsDirection,
  type StepStatus,
  type StepSize,
  type StepsProps as CoreStepsProps,
  type StepItem,
  type TigerLocale,
  type TigerLocaleSteps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

// Steps context interface
export interface StepsContextValue {
  current: number
  status: StepStatus
  direction: StepsDirection
  size: StepSize
  simple: boolean
  clickable: boolean
  labels: Required<TigerLocaleSteps>
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
  const stepsContext = useStepsContext()
  if (!stepsContext) {
    throw new Error('StepsItem must be used within a Steps component')
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

  const statusText = getStepStatusText(stepStatus, stepsContext.labels)

  const renderIcon = () => {
    const inner = icon ? (
      icon
    ) : stepStatus === 'finish' ? (
      <svg
        className="w-4 h-4 shrink-0 tiger-animate-fade-in"
        fill="none"
        stroke="currentColor"
        strokeWidth={stepFinishIconStrokeWidth}
        viewBox={stepFinishIconViewBox}
        aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={stepFinishIconPathD} />
      </svg>
    ) : stepStatus === 'error' ? (
      <span aria-hidden="true">!</span>
    ) : (
      <span aria-hidden="true">{stepIndex + 1}</span>
    )
    return (
      <div className={iconClasses} aria-hidden="true">
        {inner}
      </div>
    )
  }

  const renderContent = () => (
    <div className={contentClasses}>
      <div className={titleClasses}>{title}</div>
      {!stepsContext.simple && description && (
        <div className={descriptionClasses}>{description}</div>
      )}
    </div>
  )

  const body = (
    <>
      {stepsContext.direction === 'vertical' ? (
        <div className="relative">
          {renderIcon()}
          <div className={tailClasses} />
        </div>
      ) : (
        <>
          {renderIcon()}
          <div className={tailClasses} />
        </>
      )}
      {renderContent()}
      <span className="sr-only">{statusText}</span>
    </>
  )

  return (
    <li
      {...props}
      className={itemClasses}
      style={style as React.CSSProperties}
      aria-current={stepIndex === stepsContext.current ? 'step' : undefined}
      aria-disabled={disabled || undefined}>
      {isClickable ? (
        <button
          type="button"
          className={
            stepsContext.direction === 'vertical'
              ? 'flex w-full flex-row items-start bg-transparent p-0 text-start'
              : 'flex w-full flex-col items-center bg-transparent p-0'
          }
          onClick={handleClick}>
          {body}
        </button>
      ) : (
        body
      )}
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
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleSteps>
}

export const Steps: React.FC<StepsProps> = ({
  current = 0,
  status = 'process',
  direction = 'horizontal',
  size = 'default',
  simple = false,
  clickable = false,
  items,
  className,
  style,
  onChange,
  children,
  locale,
  labels: labelsOverride,
  ...props
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const stepLabels = useMemo(
    () => getStepsLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const { 'aria-label': ariaLabelProp, ...rest } = props

  const itemNodes = useMemo(() => {
    if (items && items.length > 0) {
      return items.map((item) => (
        <StepsItem
          key={item.key ?? item.title}
          title={item.title}
          description={item.description}
          icon={item.icon as React.ReactNode}
          status={item.status}
          disabled={item.disabled}
        />
      ))
    }
    return React.Children.toArray(children).filter(
      (child) => React.isValidElement(child) && isStepsItemType(child.type, StepsItem)
    )
  }, [items, children])

  const clampedCurrent = clampStepCurrent(current, itemNodes.length)

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
      current: clampedCurrent,
      status,
      direction,
      size,
      simple,
      clickable,
      labels: stepLabels,
      handleStepClick: clickable ? handleStepClick : undefined
    }),
    [clampedCurrent, status, direction, size, simple, clickable, stepLabels, handleStepClick]
  )

  const stepsWithProps = itemNodes.map((child, index) => {
    if (!React.isValidElement<StepsItemProps>(child)) return child
    return React.cloneElement(child, {
      stepIndex: index,
      isLast: index === itemNodes.length - 1
    })
  })

  return (
    <StepsContext.Provider value={contextValue}>
      <ol
        {...rest}
        className={containerClasses}
        style={style}
        role="list"
        aria-label={ariaLabelProp ?? stepLabels.ariaLabel}>
        {stepsWithProps}
      </ol>
    </StepsContext.Provider>
  )
}

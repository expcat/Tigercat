import React, { createContext, useContext, useMemo, useCallback, ReactElement } from 'react'
import {
  classNames,
  getStepsContainerClasses,
  type StepsDirection,
  type StepStatus,
  type StepSize,
  type StepsProps as CoreStepsProps,
} from '@tigercat/core'

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

export interface StepsProps extends CoreStepsProps {
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
}) => {
  // Container classes
  const containerClasses = useMemo(() => {
    return classNames(getStepsContainerClasses(direction), className)
  }, [direction, className])

  // Handle step click
  const handleStepClick = useCallback(
    (index: number) => {
      if (!clickable) {
        return
      }

      onChange?.(index)
    },
    [clickable, onChange]
  )

  // Context value
  const contextValue = useMemo<StepsContextValue>(
    () => ({
      current,
      status,
      direction,
      size,
      simple,
      clickable,
      handleStepClick: clickable ? handleStepClick : undefined,
    }),
    [current, status, direction, size, simple, clickable, handleStepClick]
  )

  // Add step index and isLast props to each step item
  const stepsWithProps = useMemo(() => {
    const items: ReactElement[] = []

    React.Children.forEach(children, (child, index) => {
      if (React.isValidElement(child) && child.type === StepsItem) {
        const totalCount = React.Children.count(children)
        items.push(
          React.cloneElement(child, {
            ...(child.props as object),
            stepIndex: index,
            isLast: index === totalCount - 1,
          } as any)
        )
      } else {
        items.push(child as ReactElement)
      }
    })

    return items
  }, [children])

  return (
    <StepsContext.Provider value={contextValue}>
      <div className={containerClasses} style={style}>
        {stepsWithProps}
      </div>
    </StepsContext.Provider>
  )
}

// Import StepsItem to check the type
import { StepsItem } from './StepsItem'

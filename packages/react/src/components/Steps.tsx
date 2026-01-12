import React, { createContext, useContext, ReactElement } from "react";
import {
  classNames,
  getStepsContainerClasses,
  type StepsDirection,
  type StepStatus,
  type StepSize,
  type StepsProps as CoreStepsProps,
} from "@tigercat/core";
import { StepsItem, type StepsItemProps } from "./StepsItem";

// Steps context interface
export interface StepsContextValue {
  current: number;
  status: StepStatus;
  direction: StepsDirection;
  size: StepSize;
  simple: boolean;
  clickable: boolean;
  handleStepClick?: (index: number) => void;
}

// Create steps context
const StepsContext = createContext<StepsContextValue | null>(null);

// Hook to use steps context
export function useStepsContext(): StepsContextValue | null {
  return useContext(StepsContext);
}

export interface StepsProps
  extends CoreStepsProps,
    Omit<
      React.OlHTMLAttributes<HTMLOListElement>,
      keyof CoreStepsProps | "onChange" | "children"
    > {
  /**
   * Step change event handler
   */
  onChange?: (current: number) => void;

  /**
   * Whether steps are clickable
   * @default false
   */
  clickable?: boolean;

  /**
   * Step items
   */
  children?: React.ReactNode;
}

export const Steps: React.FC<StepsProps> = ({
  current = 0,
  status = "process",
  direction = "horizontal",
  size = "default",
  simple = false,
  clickable = false,
  className,
  style,
  onChange,
  children,
  ...props
}) => {
  const containerClasses = classNames(
    getStepsContainerClasses(direction),
    className
  );

  const handleStepClick = (index: number) => {
    if (!clickable) {
      return;
    }

    onChange?.(index);
  };

  const contextValue: StepsContextValue = {
    current,
    status,
    direction,
    size,
    simple,
    clickable,
    handleStepClick: clickable ? handleStepClick : undefined,
  };

  const totalCount = React.Children.count(children);
  const stepsWithProps = React.Children.map(children, (child, index) => {
    if (
      React.isValidElement<StepsItemProps>(child) &&
      child.type === StepsItem
    ) {
      return React.cloneElement(child, {
        stepIndex: index,
        isLast: index === totalCount - 1,
      });
    }
    return child as ReactElement;
  });

  const mergedStyle = {
    ...(style ?? {}),
  };

  return (
    <StepsContext.Provider value={contextValue}>
      <ol {...props} className={containerClasses} style={mergedStyle}>
        {stepsWithProps}
      </ol>
    </StepsContext.Provider>
  );
};

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { classNames } from '@tigercat/core';
import {
  type RadioGroupProps as CoreRadioGroupProps,
  type RadioSize,
} from '@tigercat/core';

export interface RadioGroupProps extends CoreRadioGroupProps {
  /**
   * Change event handler
   */
  onChange?: (value: string | number) => void;

  /**
   * Radio group children (Radio components)
   */
  children?: React.ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

interface RadioGroupContextValue {
  value?: string | number;
  name: string;
  disabled: boolean;
  size: RadioSize;
  onChange?: (value: string | number) => void;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(
  null
);

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  defaultValue,
  name,
  disabled = false,
  size = 'md',
  onChange,
  children,
  className,
  ...props
}) => {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<
    string | number | undefined
  >(defaultValue);

  // Determine if controlled or uncontrolled
  const isControlled = value !== undefined;

  // Current value - use prop value if controlled, otherwise use internal state
  const currentValue = isControlled ? value : internalValue;

  // Update internal value when defaultValue changes in uncontrolled mode
  useEffect(() => {
    if (!isControlled) {
      setInternalValue(defaultValue);
    }
  }, [defaultValue, isControlled]);

  const handleChange = useCallback(
    (newValue: string | number) => {
      if (disabled) return;

      // Update internal state if uncontrolled
      if (!isControlled) {
        setInternalValue(newValue);
      }

      // Emit change event
      onChange?.(newValue);
    },
    [disabled, isControlled, onChange]
  );

  // Generate unique name if not provided
  const groupName = useMemo(() => {
    return (
      name ||
      `tiger-radio-group-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 11)}`
    );
  }, [name]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;

      const target = event.target as HTMLElement;
      const label = target.closest('label');
      if (!label) return;

      const container = event.currentTarget;
      const labels = Array.from(container.querySelectorAll('label'));
      const currentIndex = labels.indexOf(label);

      let nextIndex: number | null = null;

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          nextIndex = (currentIndex + 1) % labels.length;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          nextIndex = (currentIndex - 1 + labels.length) % labels.length;
          break;
        default:
          return;
      }

      if (nextIndex !== null) {
        const nextLabel = labels[nextIndex] as HTMLElement;
        const nextInput = nextLabel.querySelector(
          'input[type="radio"]'
        ) as HTMLInputElement;
        if (nextInput && !nextInput.disabled) {
          nextLabel.focus();
          nextInput.click();
        }
      }
    },
    [disabled]
  );

  const contextValue: RadioGroupContextValue = useMemo(
    () => ({
      value: currentValue,
      name: groupName,
      disabled,
      size,
      onChange: handleChange,
    }),
    [currentValue, groupName, disabled, size, handleChange]
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        className={classNames(className || 'space-y-2')}
        role="radiogroup"
        onKeyDown={handleKeyDown}
        {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

// Export context for use in Radio component
export { RadioGroupContext };

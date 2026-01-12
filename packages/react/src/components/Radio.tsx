import React, { useContext, useState } from 'react';
import {
  classNames,
  getRadioColorClasses,
  type RadioProps as CoreRadioProps,
} from '@tigercat/core';
import { RadioGroupContext } from './RadioGroup';

export interface RadioProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'type' | 'size' | 'onChange' | 'checked' | 'defaultChecked' | 'value'
    >,
    CoreRadioProps {
  /**
   * Change event handler
   */
  onChange?: (value: string | number) => void;

  /**
   * Radio label content
   */
  children?: React.ReactNode;

  /**
   * Additional CSS classes (applied to root element)
   */
  className?: string;
}

const sizeClasses = {
  sm: {
    radio: 'w-4 h-4',
    dot: 'w-1.5 h-1.5',
    label: 'text-sm',
  },
  md: {
    radio: 'w-5 h-5',
    dot: 'w-2 h-2',
    label: 'text-base',
  },
  lg: {
    radio: 'w-6 h-6',
    dot: 'w-2.5 h-2.5',
    label: 'text-lg',
  },
} as const;

export const Radio: React.FC<RadioProps> = ({
  value,
  size,
  disabled,
  name,
  checked,
  defaultChecked = false,
  onChange,
  children,
  className,
  style,
  ...props
}) => {
  const groupContext = useContext(RadioGroupContext);

  const [internalChecked, setInternalChecked] = useState(defaultChecked);

  const isCheckedControlled = checked !== undefined;
  const isInGroup = !!groupContext;

  const actualSize = size || groupContext?.size || 'md';
  const actualDisabled =
    disabled !== undefined ? disabled : groupContext?.disabled || false;
  const actualName = name || groupContext?.name || '';

  const isChecked =
    checked !== undefined
      ? checked
      : groupContext?.value !== undefined
      ? groupContext.value === value
      : internalChecked;

  const colors = getRadioColorClasses();
  const radioClasses = classNames(
    'relative inline-flex items-center justify-center rounded-full border-2 cursor-pointer transition-all',
    'peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--tiger-primary,#2563eb)] peer-focus-visible:ring-offset-[var(--tiger-surface,#ffffff)]',
    sizeClasses[actualSize].radio,
    isChecked ? colors.borderChecked : colors.border,
    isChecked ? colors.bgChecked : colors.bg,
    actualDisabled && colors.disabled,
    actualDisabled && 'cursor-not-allowed',
    !actualDisabled && 'hover:border-[var(--tiger-primary,#2563eb)]'
  );

  const dotClasses = classNames(
    'rounded-full transition-all',
    sizeClasses[actualSize].dot,
    colors.innerDot,
    isChecked ? 'scale-100' : 'scale-0'
  );

  const labelClasses = classNames(
    'ml-2 cursor-pointer select-none',
    sizeClasses[actualSize].label,
    actualDisabled ? colors.textDisabled : 'text-[var(--tiger-text,#111827)]',
    actualDisabled && 'cursor-not-allowed'
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (actualDisabled) {
      event.preventDefault();
      return;
    }

    const newChecked = event.target.checked;
    if (!newChecked) return;

    if (!isCheckedControlled && !isInGroup) {
      setInternalChecked(true);
    }

    onChange?.(value);
    groupContext?.onChange?.(value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    props.onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (actualDisabled) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      const input = event.currentTarget;
      if (!input.checked) input.click();
    }
  };

  return (
    <label
      className={classNames('inline-flex items-center', className)}
      style={style}>
      {/* Hidden native radio input */}
      <input
        type="radio"
        className="sr-only peer"
        {...props}
        name={actualName}
        value={value}
        checked={isChecked}
        disabled={actualDisabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />

      {/* Custom radio visual */}
      <span className={radioClasses} aria-hidden="true">
        <span className={dotClasses} />
      </span>

      {/* Label content */}
      {children && <span className={labelClasses}>{children}</span>}
    </label>
  );
};

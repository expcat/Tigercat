import React from 'react';
import {
  classNames,
  buttonBaseClasses,
  buttonSizeClasses,
  buttonDisabledClasses,
  getButtonVariantClasses,
  type ButtonProps as CoreButtonProps,
} from '@tigercat/core';

export interface ButtonProps
  extends CoreButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  block = false,
  onClick,
  children,
  type = 'button',
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const ariaBusy = props['aria-busy'] ?? (loading ? true : undefined);
  const ariaDisabled =
    props['aria-disabled'] ?? (isDisabled ? true : undefined);

  const buttonClasses = classNames(
    buttonBaseClasses,
    getButtonVariantClasses(variant),
    buttonSizeClasses[size],
    isDisabled && buttonDisabledClasses,
    block && 'w-full',
    className
  );

  return (
    <button
      className={buttonClasses}
      aria-busy={ariaBusy}
      aria-disabled={ariaDisabled}
      disabled={isDisabled}
      onClick={(event) => {
        if (isDisabled) return;
        onClick?.(event);
      }}
      type={type}
      {...props}>
      {loading && (
        <span className="mr-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}
      {children}
    </button>
  );
};

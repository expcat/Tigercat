import React from 'react';
import {
  classNames,
  buttonBaseClasses,
  buttonSizeClasses,
  buttonDisabledClasses,
  getButtonVariantClasses,
  getSpinnerSVG,
  type ButtonProps as CoreButtonProps,
} from '@tigercat/core';

export interface ButtonProps
  extends CoreButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {}

const spinnerSvg = getSpinnerSVG('spinner');

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
            viewBox={spinnerSvg.viewBox}
            aria-hidden="true"
            focusable="false">
            {spinnerSvg.elements.map((el, index) => {
              if (el.type === 'circle')
                return <circle key={index} {...el.attrs} />;
              if (el.type === 'path') return <path key={index} {...el.attrs} />;
              return null;
            })}
          </svg>
        </span>
      )}
      {children}
    </button>
  );
};

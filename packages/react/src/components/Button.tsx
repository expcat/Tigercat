import React, { useMemo } from 'react'
import {
  classNames,
  buttonBaseClasses,
  buttonSizeClasses,
  buttonDisabledClasses,
  getButtonVariantClasses,
  getSpinnerSVG,
  type ButtonProps as CoreButtonProps
} from '@expcat/tigercat-core'

export interface ButtonProps
  extends CoreButtonProps, Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  loadingIcon?: React.ReactNode
}

const spinnerSvg = getSpinnerSVG('spinner')

const DefaultSpinner = (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox={spinnerSvg.viewBox}
    aria-hidden="true"
    focusable="false">
    {spinnerSvg.elements.map((el, index) =>
      React.createElement(el.type, { key: index, ...el.attrs })
    )}
  </svg>
)

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  loadingIcon,
  block = false,
  onClick,
  children,
  type = 'button',
  className,
  'aria-busy': ariaBusyProp,
  'aria-disabled': ariaDisabledProp,
  ...rest
}) => {
  const isDisabled = disabled || loading
  const ariaBusy = ariaBusyProp ?? (loading ? true : undefined)
  const ariaDisabled = ariaDisabledProp ?? (isDisabled ? true : undefined)

  const buttonClasses = useMemo(
    () =>
      classNames(
        buttonBaseClasses,
        getButtonVariantClasses(variant),
        buttonSizeClasses[size],
        isDisabled && buttonDisabledClasses,
        block && 'w-full',
        className
      ),
    [variant, size, isDisabled, block, className]
  )

  return (
    <button
      {...rest}
      className={buttonClasses}
      aria-busy={ariaBusy}
      aria-disabled={ariaDisabled}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      type={type}>
      {loading && <span className="mr-2">{loadingIcon ?? DefaultSpinner}</span>}
      {children}
    </button>
  )
}

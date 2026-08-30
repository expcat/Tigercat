import React, { useMemo } from 'react'
import {
  resolveButtonClasses,
  getSpinnerSVG,
  warnUnsupportedColorProp,
  type ButtonProps as CoreButtonProps
} from '@expcat/tigercat-core'
import { useButtonGroupContext } from './ButtonGroup'

export interface ButtonProps
  extends
    CoreButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'type'> {
  loadingIcon?: React.ReactNode
  icon?: React.ReactNode
}

const createDefaultSpinner = (): React.ReactNode => {
  const spinnerSvg = getSpinnerSVG('spinner')

  return (
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
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size,
  disabled = false,
  loading = false,
  loadingIcon,
  icon,
  block = false,
  iconPosition = 'left',
  htmlType = 'button',
  danger = false,
  onClick,
  children,
  className,
  'aria-busy': ariaBusyProp,
  'aria-disabled': ariaDisabledProp,
  ...rest
}) => {
  warnUnsupportedColorProp('Button', rest as Record<string, unknown>)
  const group = useButtonGroupContext()
  const resolvedSize = size ?? group?.size ?? 'md'
  const isDisabled = disabled || loading
  const ariaBusy = ariaBusyProp ?? (loading ? true : undefined)
  const ariaDisabled = ariaDisabledProp ?? (isDisabled ? true : undefined)

  const buttonClasses = useMemo(
    () =>
      resolveButtonClasses({
        variant,
        danger,
        size: resolvedSize,
        disabled,
        loading,
        block,
        className
      }),
    [variant, danger, resolvedSize, disabled, loading, block, className]
  )

  const iconIsRight = iconPosition === 'right'

  return (
    <button
      {...rest}
      className={buttonClasses}
      aria-busy={ariaBusy}
      aria-disabled={ariaDisabled}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      type={htmlType}>
      {loading && (
        <span className={iconIsRight ? 'ml-2 order-1' : 'mr-2'}>
          {loadingIcon ?? createDefaultSpinner()}
        </span>
      )}
      {!loading && icon && <span className={iconIsRight ? 'ml-2 order-1' : 'mr-2'}>{icon}</span>}
      {children}
    </button>
  )
}

import React, { forwardRef, useMemo } from 'react'
import {
  resolveButtonClasses,
  resolveButtonHtmlType,
  resolveButtonIconPlacement,
  getButtonIconSlotClasses,
  getButtonSpinnerClasses,
  getSpinnerSVG,
  omitUnsupportedColorProp,
  warnMissingAccessibleName,
  TIGER_CHROME_ATTR,
  type ButtonHtmlType,
  type ButtonProps as CoreButtonProps,
  type ButtonSize
} from '@expcat/tigercat-core'
import { useButtonGroupContext } from './ButtonGroup'

export interface ButtonProps
  extends
    CoreButtonProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled' | 'type'> {
  loadingIcon?: React.ReactNode
  icon?: React.ReactNode
  type?: ButtonHtmlType
}

const createDefaultSpinner = (size: ButtonSize): React.ReactNode => {
  const spinnerSvg = getSpinnerSVG('spinner')

  return (
    <svg
      className={getButtonSpinnerClasses(size)}
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

function hasLabelContent(children: React.ReactNode): boolean {
  if (children == null || children === false) return false
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children).trim().length > 0
  }
  return React.Children.count(children) > 0
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size,
    disabled = false,
    loading = false,
    loadingIcon,
    icon,
    block = false,
    iconPosition = 'start',
    htmlType,
    type,
    danger = false,
    onClick,
    children,
    className,
    'aria-busy': ariaBusyProp,
    'aria-disabled': ariaDisabledProp,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    ...rest
  },
  ref
) {
  const domRest = omitUnsupportedColorProp('Button', rest as Record<string, unknown>)
  const group = useButtonGroupContext()
  const resolvedSize = size ?? group?.size ?? 'md'
  const resolvedType = resolveButtonHtmlType(htmlType, type)
  const hasLabel = hasLabelContent(children)
  warnMissingAccessibleName('Button', {
    text: hasLabel ? 'named' : '',
    ariaLabel,
    ariaLabelledby
  })

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

  const placement = resolveButtonIconPlacement(iconPosition)
  const slotClass = getButtonIconSlotClasses(placement, hasLabel)
  const chrome = loading ? (
    <span className={slotClass || undefined} aria-hidden="true">
      {loadingIcon ?? createDefaultSpinner(resolvedSize)}
    </span>
  ) : icon ? (
    <span className={slotClass || undefined} aria-hidden="true">
      {icon}
    </span>
  ) : null

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault()
      return
    }
    onClick?.(event)
  }

  return (
    <button
      {...domRest}
      ref={ref}
      {...{ [TIGER_CHROME_ATTR]: '' }}
      className={buttonClasses}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      aria-busy={ariaBusyProp ?? (loading ? true : undefined)}
      aria-disabled={ariaDisabledProp ?? (disabled ? true : undefined)}
      disabled={disabled || undefined}
      onClick={handleClick}
      type={resolvedType}>
      {placement === 'end' ? (
        <>
          {children}
          {chrome}
        </>
      ) : (
        <>
          {chrome}
          {children}
        </>
      )}
    </button>
  )
})

Button.displayName = 'Button'

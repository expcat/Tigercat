import React, { forwardRef, useMemo } from 'react'
import {
  hasAccessibleName,
  resolveButtonClasses,
  resolveButtonType,
  resolveButtonIconPlacement,
  getButtonIconSlotClasses,
  getButtonSpinnerClasses,
  getSpinnerSVG,
  warnMissingAccessibleName,
  TIGER_CHROME_ATTR,
  type ButtonHtmlType,
  type ButtonProps as CoreButtonProps,
  type ButtonSize
} from '@expcat/tigercat-core'
import { useButtonGroupContext } from './ButtonGroup'
import { useTigerConfig } from './ConfigProvider'

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

function visibleButtonText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(visibleButtonText).join('')
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode; 'aria-hidden'?: unknown }
    const hidden = props['aria-hidden']
    if (hidden === true || hidden === '' || hidden === 'true') return ''
    return visibleButtonText(props.children)
  }
  return ''
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
  const domRest = rest
  const group = useButtonGroupContext()
  const config = useTigerConfig()
  const resolvedSize = size ?? group?.size ?? 'md'
  const resolvedType = resolveButtonType(type)
  const visibleText = visibleButtonText(children).trim()
  const named = hasAccessibleName({ text: visibleText, ariaLabel, ariaLabelledby })
  const hasLabel = visibleText.length > 0

  const buttonClasses = useMemo(
    () =>
      resolveButtonClasses({
        variant,
        danger,
        size: resolvedSize,
        disabled,
        loading,
        joined: group != null,
        block,
        className
      }),
    [variant, danger, resolvedSize, disabled, loading, group, block, className]
  )

  if (!named) {
    warnMissingAccessibleName('Button', { text: '', ariaLabel, ariaLabelledby })
    return null
  }

  const placement = resolveButtonIconPlacement(iconPosition)
  const slotClass = getButtonIconSlotClasses(placement, hasLabel)
  const loadingText = config.locale?.common?.loadingText || 'Loading...'
  const chrome = loading ? (
    <span className={slotClass || undefined}>
      <span className="sr-only">{loadingText}</span>
      <span aria-hidden="true">{loadingIcon ?? createDefaultSpinner(resolvedSize)}</span>
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
      aria-disabled={ariaDisabledProp ?? (disabled || loading ? true : undefined)}
      disabled={disabled || loading || undefined}
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

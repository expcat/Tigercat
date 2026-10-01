import React, { forwardRef, useMemo } from 'react'
import {
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
import { useTigerConfig } from './tiger-config'

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

function hasLabelContent(node: React.ReactNode): boolean {
  if (node == null || typeof node === 'boolean') return false
  if (typeof node === 'string' || typeof node === 'number') return String(node).trim().length > 0
  if (Array.isArray(node)) return node.some(hasLabelContent)
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode; 'aria-hidden'?: unknown }
    const hidden = props['aria-hidden']
    if (hidden === true || hidden === '' || hidden === 'true') return false
    // A component's rendered content is only known after it renders.
    if (typeof node.type !== 'string' && node.type !== React.Fragment) return true
    return hasLabelContent(props.children)
  }
  return false
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
  const hasLabel = hasLabelContent(children)
  warnMissingAccessibleName('Button', { text: hasLabel ? 'named' : '', ariaLabel, ariaLabelledby })

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
        iconOnly: !hasLabel,
        className
      }),
    [variant, danger, resolvedSize, disabled, loading, group, block, hasLabel, className]
  )

  const placement = resolveButtonIconPlacement(iconPosition)
  const slotClass = getButtonIconSlotClasses(placement, hasLabel)
  const loadingText = config.locale?.common?.loadingText || 'Loading...'
  const chrome = loading ? (
    <span className={slotClass || undefined}>
      {hasLabel ? null : <span className="sr-only">{loadingText}</span>}
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

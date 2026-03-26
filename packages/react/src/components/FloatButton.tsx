import React, { useState, useMemo, useCallback } from 'react'
import ReactDOM from 'react-dom'
import {
  classNames,
  floatButtonBaseClasses,
  floatButtonShapeClasses,
  floatButtonSizeClasses,
  floatButtonTypeClasses,
  floatButtonDisabledClasses,
  floatButtonGroupClasses,
  type FloatButtonProps as CoreFloatButtonProps,
  type FloatButtonGroupProps as CoreFloatButtonGroupProps
} from '@expcat/tigercat-core'

// ---------------------------------------------------------------------------
// FloatButton
// ---------------------------------------------------------------------------

export interface FloatButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>, CoreFloatButtonProps {
  /** Button content (typically an icon) */
  children?: React.ReactNode
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export const FloatButton: React.FC<FloatButtonProps> = ({
  shape = 'circle',
  size = 'md',
  type = 'primary',
  tooltip,
  disabled = false,
  ariaLabel,
  className,
  children,
  onClick,
  ...props
}) => {
  const classes = useMemo(
    () =>
      classNames(
        floatButtonBaseClasses,
        floatButtonShapeClasses[shape],
        floatButtonSizeClasses[size],
        floatButtonTypeClasses[type],
        disabled && floatButtonDisabledClasses,
        className
      ),
    [shape, size, type, disabled, className]
  )

  return (
    <button
      className={classes}
      type="button"
      disabled={disabled}
      aria-label={ariaLabel ?? tooltip}
      title={tooltip}
      onClick={disabled ? undefined : onClick}
      {...props}>
      {children}
    </button>
  )
}

// ---------------------------------------------------------------------------
// FloatButtonGroup
// ---------------------------------------------------------------------------

export interface FloatButtonGroupProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>, CoreFloatButtonGroupProps {
  /** The trigger element (typically a FloatButton) */
  triggerNode?: React.ReactNode
  /** Child float buttons */
  children?: React.ReactNode
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void
}

export const FloatButtonGroup: React.FC<FloatButtonGroupProps> = ({
  shape = 'circle',
  trigger = 'click',
  open: controlledOpen,
  triggerNode,
  children,
  className,
  onOpenChange,
  ...props
}) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen ?? internalOpen

  const toggle = useCallback(() => {
    const next = !isOpen
    setInternalOpen(next)
    onOpenChange?.(next)
  }, [isOpen, onOpenChange])

  const handleMouseEnter = useCallback(() => {
    setInternalOpen(true)
    onOpenChange?.(true)
  }, [onOpenChange])

  const handleMouseLeave = useCallback(() => {
    setInternalOpen(false)
    onOpenChange?.(false)
  }, [onOpenChange])

  const groupClasses = useMemo(() => classNames(floatButtonGroupClasses, className), [className])

  if (typeof document === 'undefined') return null

  const content = (
    <div
      className={groupClasses}
      onMouseEnter={trigger === 'hover' ? handleMouseEnter : undefined}
      onMouseLeave={trigger === 'hover' ? handleMouseLeave : undefined}
      {...props}>
      {triggerNode && <div onClick={trigger === 'click' ? toggle : undefined}>{triggerNode}</div>}
      {isOpen && children}
    </div>
  )

  return ReactDOM.createPortal(content, document.body)
}

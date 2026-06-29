import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import ReactDOM from 'react-dom'
import {
  classNames,
  isBrowser,
  floatButtonBaseClasses,
  floatButtonShapeClasses,
  floatButtonSizeClasses,
  floatButtonTypeClasses,
  floatButtonDisabledClasses,
  floatButtonGroupClasses,
  getViewportOffsetStyle,
  type FloatButtonShape,
  type FloatButtonProps as CoreFloatButtonProps,
  type FloatButtonGroupProps as CoreFloatButtonGroupProps,
  viewportFloatingBaseClasses,
  viewportPlacementClasses
} from '@expcat/tigercat-core'

// Group context — lets FloatButtonGroup share its `shape` with child buttons
// that don't set their own.
const FloatButtonGroupContext = createContext<{ shape?: FloatButtonShape } | null>(null)

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
  shape,
  size = 'md',
  type = 'primary',
  tooltip,
  disabled = false,
  ariaLabel,
  className,
  floating = false,
  placement = 'bottom-right',
  offset,
  style,
  children,
  onClick,
  ...props
}) => {
  const group = useContext(FloatButtonGroupContext)
  // Explicit shape wins; otherwise inherit the group shape, else default.
  const resolvedShape: FloatButtonShape = shape ?? group?.shape ?? 'circle'
  const classes = useMemo(
    () =>
      classNames(
        floatButtonBaseClasses,
        floatButtonShapeClasses[resolvedShape],
        floatButtonSizeClasses[size],
        floatButtonTypeClasses[type],
        disabled && floatButtonDisabledClasses,
        floating && viewportFloatingBaseClasses,
        floating && viewportPlacementClasses[placement],
        className
      ),
    [resolvedShape, size, type, disabled, floating, placement, className]
  )

  const buttonStyle = useMemo(
    () => (floating ? { ...getViewportOffsetStyle(placement, offset), ...style } : style),
    [floating, placement, offset, style]
  )

  return (
    <button
      className={classes}
      type="button"
      disabled={disabled}
      style={buttonStyle}
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
  shape: groupShape,
  trigger = 'click',
  open: controlledOpen,
  triggerNode,
  children,
  className,
  onOpenChange,
  ...props
}) => {
  const groupContextValue = useMemo(() => ({ shape: groupShape }), [groupShape])
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

  if (!isBrowser()) return null

  const content = (
    <FloatButtonGroupContext.Provider value={groupContextValue}>
      <div
        className={groupClasses}
        onMouseEnter={trigger === 'hover' ? handleMouseEnter : undefined}
        onMouseLeave={trigger === 'hover' ? handleMouseLeave : undefined}
        {...props}>
        {triggerNode && <div onClick={trigger === 'click' ? toggle : undefined}>{triggerNode}</div>}
        {isOpen && children}
      </div>
    </FloatButtonGroupContext.Provider>
  )

  return ReactDOM.createPortal(content, document.body)
}

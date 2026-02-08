import React, { useCallback, useMemo, useState, useRef } from 'react'
import { useFloating, useClickOutside, useEscapeKey } from '../utils/overlay'
import {
  classNames,
  getPopoverContainerClasses,
  getPopoverTriggerClasses,
  getPopoverContentClasses,
  POPOVER_TITLE_CLASSES,
  POPOVER_TEXT_CLASSES,
  getTransformOrigin,
  type PopoverProps as CorePopoverProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'

let popoverIdCounter = 0
const createPopoverId = () => `tiger-popover-${++popoverIdCounter}`

export type PopoverProps = Omit<CorePopoverProps, 'style' | 'placement'> &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'title'> & {
    children?: React.ReactNode
    titleContent?: React.ReactNode
    contentContent?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    /** Popover placement @default 'top' */
    placement?: FloatingPlacement
    /** Offset distance in pixels @default 8 */
    offset?: number
    onVisibleChange?: (visible: boolean) => void
  }

export const Popover: React.FC<PopoverProps> = ({
  visible,
  defaultVisible = false,
  title,
  content,
  trigger = 'click',
  placement = 'top',
  disabled = false,
  width,
  offset = 8,
  className,
  style,
  children,
  titleContent,
  contentContent,
  onVisibleChange,
  ...divProps
}) => {
  const isControlled = visible !== undefined
  const [internalVisible, setInternalVisible] = useState(defaultVisible)
  const currentVisible = isControlled ? visible : internalVisible

  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const floatingRef = useRef<HTMLDivElement>(null)

  const popoverIdRef = useRef<string | null>(null)
  if (!popoverIdRef.current) popoverIdRef.current = createPopoverId()
  const popoverId = popoverIdRef.current
  const titleId = `${popoverId}-title`
  const contentId = `${popoverId}-content`

  const {
    x,
    y,
    placement: actualPlacement
  } = useFloating({
    referenceRef: triggerRef,
    floatingRef,
    enabled: currentVisible,
    placement,
    offset
  })

  const setVisible = useCallback(
    (nextVisible: boolean) => {
      if (disabled && nextVisible) return
      if (!isControlled) setInternalVisible(nextVisible)
      onVisibleChange?.(nextVisible)
    },
    [disabled, isControlled, onVisibleChange]
  )

  // Trigger event handlers
  const handleTriggerClick = useCallback(() => {
    if (!disabled && trigger === 'click') setVisible(!currentVisible)
  }, [disabled, trigger, currentVisible, setVisible])

  const handleMouseEnter = useCallback(() => {
    if (!disabled && trigger === 'hover') setVisible(true)
  }, [disabled, trigger, setVisible])

  const handleMouseLeave = useCallback(() => {
    if (!disabled && trigger === 'hover') setVisible(false)
  }, [disabled, trigger, setVisible])

  const handleFocus = useCallback(() => {
    if (!disabled && trigger === 'focus') setVisible(true)
  }, [disabled, trigger, setVisible])

  const handleBlur = useCallback(() => {
    if (!disabled && trigger === 'focus') setVisible(false)
  }, [disabled, trigger, setVisible])

  // Overlay dismiss
  useClickOutside({
    enabled: currentVisible && trigger === 'click',
    refs: [containerRef],
    onOutsideClick: () => setVisible(false),
    defer: true
  })
  useEscapeKey({
    enabled: currentVisible && trigger !== 'manual',
    onEscape: () => setVisible(false)
  })

  // Memoized classes
  const containerClasses = useMemo(
    () => classNames(getPopoverContainerClasses(), className),
    [className]
  )
  const triggerClasses = useMemo(() => getPopoverTriggerClasses(disabled), [disabled])
  const contentClasses = useMemo(() => getPopoverContentClasses(width), [width])

  const floatingStyles = useMemo<React.CSSProperties>(
    () => ({
      position: 'absolute',
      left: x,
      top: y,
      transformOrigin: getTransformOrigin(actualPlacement),
      zIndex: 1000
    }),
    [x, y, actualPlacement]
  )

  const triggerHandlers = useMemo<React.DOMAttributes<HTMLDivElement>>(() => {
    if (trigger === 'click') return { onClick: handleTriggerClick }
    if (trigger === 'hover') return { onMouseEnter: handleMouseEnter, onMouseLeave: handleMouseLeave }
    if (trigger === 'focus') return { onFocus: handleFocus, onBlur: handleBlur }
    return {}
  }, [trigger, handleTriggerClick, handleMouseEnter, handleMouseLeave, handleFocus, handleBlur])

  if (!children) return null

  const hasTitle = Boolean(title || titleContent)
  const hasContent = Boolean(content || contentContent)

  return (
    <div ref={containerRef} className={containerClasses} style={style} {...divProps}>
      <div
        ref={triggerRef}
        className={triggerClasses}
        aria-haspopup="dialog"
        aria-disabled={disabled ? 'true' : undefined}
        {...triggerHandlers}>
        {children}
      </div>

      {currentVisible && (
        <div ref={floatingRef} style={floatingStyles} aria-hidden={false}>
          <div
            id={popoverId}
            role="dialog"
            aria-modal="false"
            aria-labelledby={hasTitle ? titleId : undefined}
            aria-describedby={hasContent ? contentId : undefined}
            className={contentClasses}>
            {hasTitle && (
              <div id={titleId} className={POPOVER_TITLE_CLASSES}>
                {titleContent || title}
              </div>
            )}
            {hasContent && (
              <div id={contentId} className={POPOVER_TEXT_CLASSES}>
                {contentContent || content}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useCallback, useState, useRef } from 'react'
import { useFloating, useClickOutside, useEscapeKey } from '../utils/overlay'
import {
  classNames,
  getPopoverContainerClasses,
  getPopoverTriggerClasses,
  getPopoverContentClasses,
  getPopoverTitleClasses,
  getPopoverContentTextClasses,
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
    /**
     * Popover placement relative to trigger
     * @default 'top'
     */
    placement?: FloatingPlacement
    /**
     * Offset distance from trigger (in pixels)
     * @default 8
     */
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
  if (!popoverIdRef.current) {
    popoverIdRef.current = createPopoverId()
  }
  const popoverId = popoverIdRef.current
  const titleId = `${popoverId}-title`
  const contentId = `${popoverId}-content`

  // Floating UI positioning
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

      if (!isControlled) {
        setInternalVisible(nextVisible)
      }

      onVisibleChange?.(nextVisible)
    },
    [disabled, isControlled, onVisibleChange]
  )

  const handleTriggerClick = () => {
    if (disabled || trigger !== 'click') return
    setVisible(!currentVisible)
  }

  const handleTriggerMouseEnter = () => {
    if (disabled || trigger !== 'hover') return
    setVisible(true)
  }

  const handleTriggerMouseLeave = () => {
    if (disabled || trigger !== 'hover') return
    setVisible(false)
  }

  const handleTriggerFocus = () => {
    if (disabled || trigger !== 'focus') return
    setVisible(true)
  }

  const handleTriggerBlur = () => {
    if (disabled || trigger !== 'focus') return
    setVisible(false)
  }

  // Click outside handler (only for click trigger)
  useClickOutside({
    enabled: currentVisible && trigger === 'click',
    refs: [containerRef],
    onOutsideClick: () => setVisible(false),
    defer: true
  })

  // Escape key handler
  useEscapeKey({
    enabled: currentVisible && trigger !== 'manual',
    onEscape: () => setVisible(false)
  })

  const containerClasses = classNames(getPopoverContainerClasses(), className)
  const triggerClasses = getPopoverTriggerClasses(disabled)
  const contentClasses = getPopoverContentClasses(width)
  const titleClasses = getPopoverTitleClasses()
  const contentTextClasses = getPopoverContentTextClasses()

  const floatingStyles: React.CSSProperties = {
    position: 'absolute',
    left: x,
    top: y,
    transformOrigin: getTransformOrigin(actualPlacement),
    zIndex: 1000
  }

  const triggerHandlers: React.DOMAttributes<HTMLDivElement> = {}
  if (trigger === 'click') {
    triggerHandlers.onClick = handleTriggerClick
  } else if (trigger === 'hover') {
    triggerHandlers.onMouseEnter = handleTriggerMouseEnter
    triggerHandlers.onMouseLeave = handleTriggerMouseLeave
  } else if (trigger === 'focus') {
    triggerHandlers.onFocus = handleTriggerFocus
    triggerHandlers.onBlur = handleTriggerBlur
  }

  if (!children) {
    return null
  }

  const hasTitle = Boolean(title || titleContent)
  const hasContent = Boolean(content || contentContent)
  const describedBy = hasContent ? contentId : undefined

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
            aria-describedby={describedBy}
            className={contentClasses}>
            {hasTitle && (
              <div id={titleId} className={titleClasses}>
                {titleContent || title}
              </div>
            )}

            {hasContent && (
              <div id={contentId} className={contentTextClasses}>
                {contentContent || content}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

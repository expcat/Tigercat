import React, { useMemo, useRef } from 'react'
import { usePopup } from '../utils/use-popup'
import {
  classNames,
  createFloatingIdFactory,
  getPopoverContainerClasses,
  getPopoverTriggerClasses,
  getPopoverContentClasses,
  POPOVER_TITLE_CLASSES,
  POPOVER_TEXT_CLASSES,
  type PopoverProps as CorePopoverProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'

const createPopoverId = createFloatingIdFactory('popover')

export type PopoverProps = Omit<CorePopoverProps, 'style' | 'placement'> &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'title'> & {
    children?: React.ReactNode
    titleContent?: React.ReactNode
    contentContent?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    placement?: FloatingPlacement
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
  const popoverIdRef = useRef<string | null>(null)
  if (!popoverIdRef.current) popoverIdRef.current = createPopoverId()
  const popoverId = popoverIdRef.current
  const titleId = `${popoverId}-title`
  const contentId = `${popoverId}-content`

  // Shared popup logic
  const {
    currentVisible,
    containerRef,
    triggerRef,
    floatingRef,
    floatingStyles,
    triggerHandlers
  } = usePopup({ visible, defaultVisible, disabled, trigger, placement, offset, onVisibleChange })

  // Memoized classes
  const containerClasses = useMemo(
    () => classNames(getPopoverContainerClasses(), className),
    [className]
  )
  const triggerClasses = useMemo(() => getPopoverTriggerClasses(disabled), [disabled])
  const contentClasses = useMemo(() => getPopoverContentClasses(width), [width])

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

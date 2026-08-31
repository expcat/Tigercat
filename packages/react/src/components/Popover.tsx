import React, { forwardRef, useEffect, useId, useMemo } from 'react'
import { usePopup } from '../utils/use-popup'
import { renderOverlayPortal, useFocusTrap } from '../utils/overlay'
import { composeRefs, renderOverlayTrigger } from '../utils/overlay-trigger'
import {
  classNames,
  getFocusableElements,
  getOverlayTriggerAria,
  getPopoverContainerClasses,
  getPopoverContentClasses,
  getPopoverContentStyle,
  getPopoverTriggerClasses,
  POPOVER_TITLE_CLASSES,
  POPOVER_TEXT_CLASSES,
  type PopoverProps as CorePopoverProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'

export type PopoverProps = Omit<CorePopoverProps, 'style' | 'placement'> &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'title'> & {
    children?: React.ReactNode | ((state: { open: boolean }) => React.ReactNode)
    titleContent?: React.ReactNode
    contentContent?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    placement?: FloatingPlacement
    offset?: number
    asChild?: boolean
    onOpenChange?: (open: boolean) => void
  }

export const Popover = forwardRef<HTMLElement, PopoverProps>(function Popover(
  {
    open,
    defaultOpen = false,
    title,
    content,
    trigger = 'click',
    placement = 'top',
    disabled = false,
    width,
    offset = 8,
    asChild = false,
    className,
    style,
    children,
    titleContent,
    contentContent,
    onOpenChange,
    ...divProps
  },
  forwardedRef
) {
  const popoverId = `tiger-popover-${useId()}`
  const titleId = `${popoverId}-title`
  const contentId = `${popoverId}-content`

  const {
    currentVisible,
    containerRef,
    triggerRef,
    floatingRef,
    floatingStyles,
    floatingClasses,
    positioned,
    overlayTarget,
    triggerHandlers
  } = usePopup({ open, defaultOpen, disabled, trigger, placement, offset, onOpenChange })

  const trapEnabled = Boolean(currentVisible && trigger === 'click')
  useFocusTrap({ enabled: trapEnabled, containerRef: floatingRef })

  useEffect(() => {
    if (!currentVisible || trigger !== 'click') return
    const frame = requestAnimationFrame(() => {
      const root = floatingRef.current
      if (!root) return
      const dialog = root.querySelector<HTMLElement>('[role="dialog"]') ?? root
      const first = getFocusableElements(dialog)[0] ?? dialog
      first.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [currentVisible, trigger, floatingRef])

  const containerClasses = useMemo(
    () => classNames(getPopoverContainerClasses(), className),
    [className]
  )
  const triggerClasses = useMemo(() => getPopoverTriggerClasses(disabled), [disabled])
  const hasCustomWidth = Boolean(getPopoverContentStyle(width))
  const contentClasses = useMemo(() => getPopoverContentClasses(hasCustomWidth), [hasCustomWidth])
  const contentStyle = useMemo(() => getPopoverContentStyle(width), [width])

  if (!children) return null

  const resolvedChildren =
    typeof children === 'function' ? children({ open: Boolean(currentVisible) }) : children

  const hasTitle = Boolean(title || titleContent)
  const hasContent = Boolean(content || contentContent)
  const triggerAria = getOverlayTriggerAria({
    kind: 'dialog',
    open: Boolean(currentVisible),
    controlsId: popoverId,
    disabled
  })

  return (
    <div ref={containerRef} className={containerClasses} style={style} {...divProps}>
      {renderOverlayTrigger({
        asChild,
        child: resolvedChildren,
        triggerRef: composeRefs(forwardedRef, triggerRef),
        className: asChild ? undefined : triggerClasses,
        disabled,
        aria: triggerAria,
        handlers: {
          onClick: triggerHandlers.onClick as ((event: React.MouseEvent) => void) | undefined,
          onMouseEnter: triggerHandlers.onMouseEnter,
          onMouseLeave: triggerHandlers.onMouseLeave,
          onFocus: triggerHandlers.onFocus,
          onBlur: triggerHandlers.onBlur
        }
      })}

      {currentVisible &&
        renderOverlayPortal(
          <div
            ref={floatingRef}
            className={floatingClasses}
            style={floatingStyles}
            data-positioned={positioned}
            aria-hidden={false}>
            <div
              id={popoverId}
              role="dialog"
              aria-modal="false"
              tabIndex={-1}
              aria-label={hasTitle ? undefined : title || content || undefined}
              aria-labelledby={hasTitle ? titleId : undefined}
              aria-describedby={hasContent ? contentId : undefined}
              className={contentClasses}
              style={contentStyle}>
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
          </div>,
          overlayTarget
        )}
    </div>
  )
})

Popover.displayName = 'Popover'

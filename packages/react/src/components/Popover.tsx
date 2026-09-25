import React, { forwardRef, useEffect, useId, useMemo, useRef } from 'react'
import { usePopup } from '../utils/use-popup'
import { useTooltipDelayGroup } from '../utils/tooltip-delay'
import { renderOverlayPortal } from '../utils/overlay'
import { composeRefs, renderOverlayTrigger } from '../utils/overlay-trigger'
import {
  classNames,
  devWarn,
  getOverlayTriggerAria,
  getPopoverContainerClasses,
  getPopoverContentClasses,
  getPopoverContentStyle,
  getPopoverTriggerClasses,
  resolvePopoverWidth,
  getArrowStyles,
  getOverlayArrowClasses,
  POPOVER_TITLE_CLASSES,
  POPOVER_TEXT_CLASSES,
  type PopoverProps as CorePopoverProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'

export type PopoverProps = Omit<CorePopoverProps, 'style' | 'placement' | 'content'> &
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'children' | 'className' | 'style' | 'title' | 'content'
  > & {
    children?: React.ReactNode | ((state: { open: boolean }) => React.ReactNode)
    titleContent?: React.ReactNode
    content?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    placement?: FloatingPlacement
    offset?: number
    closeOnScroll?: boolean
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
    ariaLabel,
    showDelay,
    hideDelay,
    offset = 8,
    closeOnScroll = false,
    asChild = false,
    className,
    style,
    children,
    titleContent,
    onOpenChange,
    ...divProps
  },
  forwardedRef
) {
  const popoverId = `tiger-popover-${useId()}`
  const titleId = `${popoverId}-title`
  const contentId = `${popoverId}-content`

  const delayGroup = useTooltipDelayGroup()
  const arrowRef = useRef<HTMLElement>(null)
  const {
    currentVisible,
    setVisible,
    containerRef,
    triggerRef,
    floatingRef,
    floatingStyles,
    floatingClasses,
    actualPlacement,
    positioned,
    overlayTarget,
    triggerHandlers,
    arrowX,
    arrowY
  } = usePopup({
    open,
    defaultOpen,
    disabled,
    trigger,
    placement,
    offset,
    showDelay,
    hideDelay,
    onOpenChange,
    arrowRef,
    getSkipShowDelay: () => delayGroup?.shouldSkip() ?? false,
    onShown: () => delayGroup?.noteOpen()
  })

  useEffect(() => {
    if (!closeOnScroll || !currentVisible) return
    const onScroll = () => setVisible(false)
    window.addEventListener('scroll', onScroll, true)
    return () => window.removeEventListener('scroll', onScroll, true)
  }, [closeOnScroll, currentVisible, setVisible])

  useEffect(() => {
    const resolved = resolvePopoverWidth(width)
    if (resolved.invalid) {
      devWarn(
        'popover.width',
        `[Tigercat] Popover width ${String(width)} is not a positive pixel count or a CSS length. The default max-width is used.`
      )
    }
    if (!title && !titleContent && !ariaLabel) {
      devWarn(
        'popover.name',
        '[Tigercat] Popover has no title or aria-label. Pass a short ariaLabel; the body is only the description.'
      )
    }
  }, [width, title, titleContent, ariaLabel])

  const containerClasses = useMemo(
    () => classNames(getPopoverContainerClasses(), className),
    [className]
  )
  const triggerClasses = useMemo(() => getPopoverTriggerClasses(disabled), [disabled])
  const hasCustomWidth = Boolean(getPopoverContentStyle(width))
  const contentClasses = useMemo(() => getPopoverContentClasses(hasCustomWidth), [hasCustomWidth])
  const contentStyle = useMemo(() => getPopoverContentStyle(width), [width])
  const arrowClasses = useMemo(() => getOverlayArrowClasses(actualPlacement), [actualPlacement])
  const arrowStyle = useMemo(
    () => getArrowStyles(actualPlacement, { x: arrowX, y: arrowY }) as React.CSSProperties,
    [actualPlacement, arrowX, arrowY]
  )

  if (!children) return null

  const resolvedChildren =
    typeof children === 'function' ? children({ open: Boolean(currentVisible) }) : children

  const hasTitle = Boolean(title || titleContent)
  const hasContent = Boolean(content)
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
            <div className="relative">
              <span
                ref={arrowRef}
                data-tiger-floating-arrow=""
                className={arrowClasses}
                style={arrowStyle}
                aria-hidden="true"
              />
              <div
                id={popoverId}
                role="dialog"
                aria-modal="false"
                aria-label={hasTitle ? undefined : ariaLabel}
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
                    {content}
                  </div>
                )}
              </div>
            </div>
          </div>,
          overlayTarget
        )}
    </div>
  )
})

Popover.displayName = 'Popover'

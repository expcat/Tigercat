import React, { forwardRef, useEffect, useId, useMemo } from 'react'
import { usePopup } from '../utils/use-popup'
import { TooltipDelayProvider, useTooltipDelayGroup } from '../utils/tooltip-delay'
export { TooltipDelayProvider }
import { renderOverlayPortal } from '../utils/overlay'
import { composeRefs, renderOverlayTrigger } from '../utils/overlay-trigger'
import {
  classNames,
  devWarn,
  getFocusableElements,
  getOverlayTriggerAria,
  getTooltipContainerClasses,
  getTooltipTriggerClasses,
  getFloatingArrowStyle,
  getTooltipArrowClasses,
  getTooltipContentClasses,
  type TooltipProps as CoreTooltipProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'

export type TooltipProps = Omit<CoreTooltipProps, 'content' | 'placement'> &
  Omit<
    React.HTMLAttributes<HTMLDivElement>,
    'children' | 'className' | 'style' | 'content' | 'title'
  > & {
    children?: React.ReactNode
    content?: string
    className?: string
    style?: React.CSSProperties
    placement?: FloatingPlacement
    offset?: number
    asChild?: boolean
    onOpenChange?: (open: boolean) => void
  }

export const Tooltip = forwardRef<HTMLElement, TooltipProps>(function Tooltip(
  {
    open,
    defaultOpen = false,
    content,
    trigger = 'hover',
    placement = 'top',
    disabled = false,
    offset = 8,
    showDelay,
    hideDelay,
    asChild = false,
    className,
    style,
    children,
    onOpenChange,
    ...divProps
  },
  forwardedRef
) {
  const tooltipId = `tiger-tooltip-${useId()}`
  const delayGroup = useTooltipDelayGroup()

  const {
    currentVisible,
    containerRef,
    triggerRef,
    floatingRef,
    floatingStyles,
    floatingClasses,
    actualPlacement,
    positioned,
    overlayTarget,
    triggerHandlers
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
    getSkipShowDelay: () => delayGroup?.shouldSkip() ?? false,
    onShown: () => delayGroup?.noteOpen()
  })

  useEffect(() => {
    if (!currentVisible) return
    const root = floatingRef.current
    if (root && getFocusableElements(root).length > 0) {
      devWarn(
        'tooltip.content',
        '[Tigercat] Tooltip content is plain text. Use Popover for interactive content.'
      )
    }
  }, [currentVisible, floatingRef, content])

  const containerClasses = useMemo(
    () => classNames(getTooltipContainerClasses(), className),
    [className]
  )
  const triggerClasses = useMemo(() => getTooltipTriggerClasses(disabled), [disabled])
  const contentClasses = useMemo(() => getTooltipContentClasses(), [])

  if (!children) return null

  const triggerAria = getOverlayTriggerAria({
    kind: 'tooltip',
    open: Boolean(currentVisible),
    describedBy: tooltipId,
    disabled
  })

  return (
    <div ref={containerRef} className={containerClasses} style={style} {...divProps}>
      {renderOverlayTrigger({
        asChild,
        child: children,
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
            <div id={tooltipId} role="tooltip" className={contentClasses}>
              {content}
            </div>
            <span
              data-tiger-floating-arrow=""
              className={getTooltipArrowClasses()}
              style={getFloatingArrowStyle(actualPlacement)}
            />
          </div>,
          overlayTarget
        )}
    </div>
  )
})

Tooltip.displayName = 'Tooltip'

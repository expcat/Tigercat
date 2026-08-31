import React, { forwardRef, useId, useMemo } from 'react'
import { usePopup } from '../utils/use-popup'
import { renderOverlayPortal } from '../utils/overlay'
import { composeRefs, renderOverlayTrigger } from '../utils/overlay-trigger'
import {
  classNames,
  getOverlayTriggerAria,
  getTooltipContainerClasses,
  getTooltipTriggerClasses,
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
    content?: React.ReactNode
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
          </div>,
          overlayTarget
        )}
    </div>
  )
})

Tooltip.displayName = 'Tooltip'

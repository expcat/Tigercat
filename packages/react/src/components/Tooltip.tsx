import React, { useMemo, useRef } from 'react'
import { usePopup } from '../utils/use-popup'
import {
  classNames,
  createFloatingIdFactory,
  getTooltipContainerClasses,
  getTooltipTriggerClasses,
  getTooltipContentClasses,
  type TooltipProps as CoreTooltipProps,
  type FloatingPlacement
} from '@expcat/tigercat-core'

const createTooltipId = createFloatingIdFactory('tooltip')

export type TooltipProps = Omit<CoreTooltipProps, 'content' | 'placement'> &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'children' | 'className' | 'style' | 'content'> & {
    children?: React.ReactNode
    content?: React.ReactNode
    className?: string
    style?: React.CSSProperties
    placement?: FloatingPlacement
    offset?: number
    onVisibleChange?: (visible: boolean) => void
  }

export const Tooltip: React.FC<TooltipProps> = ({
  visible,
  defaultVisible = false,
  content,
  trigger = 'hover',
  placement = 'top',
  disabled = false,
  offset = 8,
  className,
  style,
  children,
  onVisibleChange,
  ...divProps
}) => {
  const tooltipIdRef = useRef<string | null>(null)
  if (!tooltipIdRef.current) tooltipIdRef.current = createTooltipId()
  const tooltipId = tooltipIdRef.current
  const describedBy = content != null ? tooltipId : undefined

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
    () => classNames(getTooltipContainerClasses(), className),
    [className]
  )
  const triggerClasses = useMemo(() => getTooltipTriggerClasses(disabled), [disabled])
  const contentClasses = useMemo(() => getTooltipContentClasses(), [])

  if (!children) return null

  return (
    <div ref={containerRef} className={containerClasses} style={style} {...divProps}>
      <div
        ref={triggerRef}
        className={triggerClasses}
        aria-describedby={describedBy}
        {...triggerHandlers}>
        {children}
      </div>

      {currentVisible && (
        <div ref={floatingRef} style={floatingStyles} aria-hidden={false}>
          <div id={tooltipId} role="tooltip" className={contentClasses}>
            {content}
          </div>
        </div>
      )}
    </div>
  )
}

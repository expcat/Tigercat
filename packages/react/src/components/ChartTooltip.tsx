import React, { useRef, useEffect, useState, useMemo } from 'react'
import {
  classNames,
  chartTooltipBaseClasses,
  getChartTooltipTransform,
  isBrowser,
  resolveChartTooltipPosition
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useOverlayPortalTarget } from '../utils/overlay'

export interface ChartTooltipProps {
  content?: string
  open?: boolean
  x?: number
  y?: number
  className?: string
  children?: React.ReactNode
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  content,
  open = false,
  x = 0,
  y = 0,
  className,
  children
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const { anchorRef, target } = useOverlayPortalTarget()
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y })
  const body = children ?? content

  useEffect(() => {
    if (!open || !isBrowser()) return

    const initialPosition = resolveChartTooltipPosition({
      x,
      y,
      rect: { width: 0, height: 0 },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    })

    const frameHandle = requestAnimationFrame(() => {
      if (!tooltipRef.current) return

      const rect = tooltipRef.current.getBoundingClientRect()
      setAdjustedPosition(
        resolveChartTooltipPosition({
          x,
          y,
          rect,
          viewport: { width: window.innerWidth, height: window.innerHeight }
        })
      )
    })

    setAdjustedPosition(initialPosition)
    return () => cancelAnimationFrame(frameHandle)
  }, [x, y, open, body])

  const tooltipClasses = useMemo(() => classNames(chartTooltipBaseClasses, className), [className])

  return (
    <>
      <span ref={anchorRef} hidden />
      {open && body
        ? renderOverlayPortal(
            <div
              ref={tooltipRef}
              className={tooltipClasses}
              style={{
                transform: getChartTooltipTransform(adjustedPosition)
              }}
              role="tooltip"
              data-chart-tooltip="true">
              {body}
            </div>,
            target
          )
        : null}
    </>
  )
}

export default ChartTooltip

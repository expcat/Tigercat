import React, { useRef, useEffect, useState, useMemo, useId } from 'react'
import {
  classNames,
  chartTooltipBaseClasses,
  chartTooltipLines,
  getChartTooltipTransform,
  isBrowser,
  registerEscapeDismiss,
  resolveChartTooltipPosition
} from '@expcat/tigercat-core'
import { renderOverlayPortal, useOverlayPortalTarget } from '../utils/overlay'

export interface ChartTooltipProps {
  content?: string
  open?: boolean
  x?: number
  y?: number
  className?: string
  id?: string
  onDismiss?: () => void
  children?: React.ReactNode
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  content,
  open = false,
  x = 0,
  y = 0,
  className,
  id,
  onDismiss,
  children
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null)
  const { anchorRef, target } = useOverlayPortalTarget()
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y })
  const [mounted, setMounted] = useState(false)
  const generatedId = useId()
  const tooltipId = id ?? generatedId
  const lines = chartTooltipLines(content ?? '')
  const body =
    children ??
    (lines.length > 1 ? (
      <ul className="m-0 list-none whitespace-pre-line p-0">
        {lines.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ul>
    ) : (
      content
    ))

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

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open || !isBrowser() || !onDismiss) return undefined
    return registerEscapeDismiss(document, onDismiss, () => tooltipRef.current)
  }, [open, onDismiss])

  return (
    <>
      <span ref={anchorRef} hidden />
      {open && body
        ? renderOverlayPortal(
            <div
              ref={tooltipRef}
              id={tooltipId}
              className={tooltipClasses}
              style={{
                transform: getChartTooltipTransform(adjustedPosition)
              }}
              role="tooltip"
              data-chart-tooltip="true">
              {body}
            </div>,
            mounted ? target : null
          )
        : null}
    </>
  )
}

export default ChartTooltip

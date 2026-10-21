import React, { useRef, useEffect, useState, useMemo, useCallback, useId } from 'react'
import {
  classNames,
  chartTooltipBaseClasses,
  chartTooltipLines,
  chartTooltipViewport,
  getChartTooltipTransform,
  isBrowser,
  mapChartTooltipPointToDocument,
  observeElementSize,
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
  // Track the real tooltip node: it may appear, be replaced, or disappear
  // while open stays true, and the size observer must follow it.
  const [tooltipNode, setTooltipNode] = useState<HTMLDivElement | null>(null)
  const bindTooltipRef = useCallback((node: HTMLDivElement | null) => {
    tooltipRef.current = node
    setTooltipNode(node)
  }, [])
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

  const place = useCallback(() => {
    const node = tooltipRef.current
    const host = node?.ownerDocument ?? target?.ownerDocument ?? document
    const point = mapChartTooltipPointToDocument({ x, y }, document, host)
    const rect = node ? node.getBoundingClientRect() : { width: 0, height: 0 }
    return resolveChartTooltipPosition({
      x: point.x,
      y: point.y,
      rect,
      viewport: chartTooltipViewport(host)
    })
  }, [x, y, target])

  // Skip state writes (and the render they would schedule) when the resolved
  // position is unchanged; multi-line bodies used to loop through new element
  // identities and unbounded setState.
  const writePosition = useCallback(
    (write: (prev: { x: number; y: number }) => { x: number; y: number }) => {
      setAdjustedPosition((prev) => {
        const next = write(prev)
        return prev.x === next.x && prev.y === next.y ? prev : next
      })
    },
    []
  )

  useEffect(() => {
    if (!open || !isBrowser()) return

    writePosition(() => place())

    const frameHandle = requestAnimationFrame(() => {
      if (!tooltipRef.current) return
      writePosition(() => place())
    })

    return () => cancelAnimationFrame(frameHandle)
  }, [open, mounted, place, writePosition])

  // Re-place when the tooltip's real border box changes, including children
  // that resize themselves without prop or children identity changes.
  useEffect(() => {
    if (!open || !isBrowser() || !tooltipNode) return undefined
    return observeElementSize(tooltipNode, () => {
      writePosition(() => place())
    })
  }, [open, tooltipNode, place, writePosition])

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
              ref={bindTooltipRef}
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

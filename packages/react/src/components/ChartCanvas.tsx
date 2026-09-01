import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  chartCanvasBaseClasses,
  chartCanvasHostClasses,
  classNames,
  createChartResizeObserverController,
  DEFAULT_CHART_PADDING,
  DEFAULT_CHART_SIZE,
  getChartInnerRect,
  resolveResponsiveChartSize,
  type ChartCanvasProps as CoreChartCanvasProps,
  type ChartCanvasRenderContext,
  type ChartCanvasSize,
  type ChartPadding
} from '@expcat/tigercat-core'

export interface ChartCanvasProps
  extends
    CoreChartCanvasProps,
    Omit<React.SVGAttributes<SVGSVGElement>, keyof CoreChartCanvasProps | 'children'> {
  padding?: ChartPadding
  children?: React.ReactNode | ((ctx: ChartCanvasRenderContext) => React.ReactNode)
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  width = DEFAULT_CHART_SIZE.width,
  height = DEFAULT_CHART_SIZE.height,
  responsive = false,
  padding = DEFAULT_CHART_PADDING,
  className,
  title,
  desc,
  children,
  onResolvedSizeChange,
  ...props
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const labelId = useId()
  const [observedSize, setObservedSize] = useState<ChartCanvasSize | null>(null)
  const lastReportedSizeRef = useRef<ChartCanvasSize | null>(null)
  const resizeControllerRef = useRef(
    createChartResizeObserverController({
      onSizeChange: setObservedSize
    })
  )
  const resolvedSize = useMemo(
    () => resolveResponsiveChartSize({ width, height }, responsive ? observedSize : null),
    [width, height, responsive, observedSize]
  )
  const innerRect = useMemo(
    () => getChartInnerRect(resolvedSize.width, resolvedSize.height, padding),
    [resolvedSize.width, resolvedSize.height, padding]
  )
  const svgClasses = useMemo(() => classNames(chartCanvasBaseClasses, className), [className])
  const titleId = title ? `${labelId}-title` : undefined
  const descId = desc ? `${labelId}-desc` : undefined
  const named = Boolean(title || props['aria-label'])

  useEffect(() => {
    const controller = resizeControllerRef.current
    if (!responsive) {
      controller.disconnect()
      setObservedSize(null)
      return undefined
    }

    const target = hostRef.current
    if (!target) return undefined

    controller.observe(target)
    return () => controller.disconnect()
  }, [responsive])

  useEffect(() => {
    if (!onResolvedSizeChange) return
    const prev = lastReportedSizeRef.current
    if (prev && prev.width === resolvedSize.width && prev.height === resolvedSize.height) {
      return
    }
    const nextSize = { width: resolvedSize.width, height: resolvedSize.height }
    lastReportedSizeRef.current = nextSize
    onResolvedSizeChange(nextSize)
  }, [resolvedSize.width, resolvedSize.height, onResolvedSizeChange])

  const content =
    typeof children === 'function'
      ? children({ innerRect, width: resolvedSize.width, height: resolvedSize.height })
      : children

  return (
    <div ref={hostRef} className={chartCanvasHostClasses} data-chart-canvas-host="">
      <svg
        {...props}
        width={resolvedSize.width}
        height={resolvedSize.height}
        viewBox={`0 0 ${resolvedSize.width} ${resolvedSize.height}`}
        className={svgClasses}
        role={named ? 'img' : undefined}
        aria-labelledby={titleId}
        aria-describedby={descId}>
        {title ? <title id={titleId}>{title}</title> : null}
        {desc ? <desc id={descId}>{desc}</desc> : null}
        <g transform={`translate(${innerRect.x}, ${innerRect.y})`}>{content}</g>
      </svg>
    </div>
  )
}

export default ChartCanvas

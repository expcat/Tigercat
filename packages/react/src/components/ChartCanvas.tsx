import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  chartCanvasBaseClasses,
  classNames,
  createChartResizeObserverController,
  getChartInnerRect,
  resolveResponsiveChartSize,
  type ChartCanvasProps as CoreChartCanvasProps,
  type ChartCanvasSize,
  type ChartPadding
} from '@expcat/tigercat-core'

export interface ChartCanvasProps
  extends
    CoreChartCanvasProps,
    Omit<React.SVGAttributes<SVGSVGElement>, keyof CoreChartCanvasProps> {
  padding?: ChartPadding
}

export const ChartCanvas: React.FC<ChartCanvasProps> = ({
  width = 320,
  height = 200,
  responsive = false,
  padding = 24,
  className,
  title,
  desc,
  children,
  ...props
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [observedSize, setObservedSize] = useState<ChartCanvasSize | null>(null)
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

  useEffect(() => {
    const controller = resizeControllerRef.current
    if (!responsive) {
      controller.disconnect()
      setObservedSize(null)
      return undefined
    }

    const target = svgRef.current?.parentElement
    if (!target) return undefined

    controller.observe(target)
    return () => controller.disconnect()
  }, [responsive])

  return (
    <svg
      {...props}
      ref={svgRef}
      width={resolvedSize.width}
      height={resolvedSize.height}
      viewBox={`0 0 ${resolvedSize.width} ${resolvedSize.height}`}
      className={svgClasses}>
      {title ? <title>{title}</title> : null}
      {desc ? <desc>{desc}</desc> : null}
      <g transform={`translate(${innerRect.x}, ${innerRect.y})`}>{children}</g>
    </svg>
  )
}

export default ChartCanvas

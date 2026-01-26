import React, { useMemo } from 'react'
import {
  chartCanvasBaseClasses,
  classNames,
  getChartInnerRect,
  type ChartCanvasProps as CoreChartCanvasProps,
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
  padding = 24,
  className,
  children,
  ...props
}) => {
  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [width, height, padding]
  )
  const svgClasses = useMemo(() => classNames(chartCanvasBaseClasses, className), [className])

  return (
    <svg
      {...props}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={svgClasses}>
      <g transform={`translate(${innerRect.x}, ${innerRect.y})`}>{children}</g>
    </svg>
  )
}

export default ChartCanvas

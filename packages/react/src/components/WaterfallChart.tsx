import React, { useRef } from 'react'
import {
  downloadChartSvg,
  getW9DataLabels,
  layoutWaterfall,
  type WaterfallChartProps as CoreWaterfallChartProps,
  type WaterfallDatum
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'

export type WaterfallChartProps = CoreWaterfallChartProps

const KIND_COLOR: Record<WaterfallDatum['kind'], string> = {
  increase: 'var(--tiger-success, #16a34a)',
  decrease: 'var(--tiger-danger, #dc2626)',
  total: 'var(--tiger-text-secondary, #64748b)'
}

export function WaterfallChart({
  data,
  width = 480,
  height = 280,
  colors,
  title,
  className,
  responsive = true
}: WaterfallChartProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const laid = layoutWaterfall(data)
  const samples = laid.flatMap((bar) => [bar.y0, bar.y1])
  const min = Math.min(0, ...samples, 0)
  const max = Math.max(0, ...samples, 1)
  const span = max - min || 1
  const exportChart = () => {
    const svg = hostRef.current?.querySelector('svg')
    if (svg instanceof SVGSVGElement) downloadChartSvg(svg, 'waterfall')
  }
  return (
    <div ref={hostRef} className={className}>
      <button type="button" onClick={exportChart}>
        {getW9DataLabels().exportChart}
      </button>
      <ChartCanvas width={width} height={height} title={title} responsive={responsive} padding={24}>
        {(ctx) => {
          const band = laid.length > 0 ? ctx.innerRect.width / laid.length : 0
          return laid.map((bar) => {
            const topValue = Math.max(bar.y0, bar.y1)
            const bottomValue = Math.min(bar.y0, bar.y1)
            const y = ((max - topValue) / span) * ctx.innerRect.height
            const barHeight = Math.max(1, ((topValue - bottomValue) / span) * ctx.innerRect.height)
            return (
              <rect
                key={bar.index}
                data-waterfall-bar={bar.kind}
                x={bar.index * band + 2}
                y={y}
                width={Math.max(1, band - 4)}
                height={barHeight}
                fill={colors?.[bar.kind] ?? KIND_COLOR[bar.kind]}
              />
            )
          })
        }}
      </ChartCanvas>
    </div>
  )
}

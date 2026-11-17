import { useRef } from 'react'
import {
  downloadChartSvg,
  getW9DataLabels,
  getChartLabels,
  resolveButtonClasses,
  layoutWaterfall,
  type WaterfallChartProps as CoreWaterfallChartProps,
  type WaterfallDatum
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { ChartCanvas } from './ChartCanvas'

export type WaterfallChartProps = CoreWaterfallChartProps

const KIND_COLOR: Record<WaterfallDatum['kind'], string> = {
  increase: 'var(--tiger-success, #16a34a)',
  decrease: 'var(--tiger-error, #dc2626)',
  total: 'var(--tiger-text-secondary, #64748b)'
}

export function WaterfallChart({
  data,
  width = 480,
  height = 280,
  padding = 24,
  colors,
  title,
  desc,
  className,
  responsive = true
}: WaterfallChartProps) {
  const config = useTigerConfig()
  const labels = getChartLabels(config.locale)
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
      <button
        type="button"
        className={resolveButtonClasses({ variant: 'outline', size: 'sm' })}
        onClick={exportChart}>
        {getW9DataLabels(config.locale).exportChart}
      </button>
      <ChartCanvas
        width={width}
        height={height}
        title={title}
        desc={desc}
        aria-label={title ? undefined : labels.waterfallChartAriaLabel}
        responsive={responsive}
        padding={padding}>
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
                role="img"
                aria-label={bar.label}
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

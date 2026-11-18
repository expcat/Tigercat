import { useRef, type HTMLAttributes, type ReactElement } from 'react'
import {
  downloadChartSvg,
  getCartesianChartShellClasses,
  getChartLabels,
  mergeTigerLocale,
  resolveButtonClasses,
  layoutSankey,
  readPageWritingDirection,
  type SankeyChartProps as CoreSankeyChartProps
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { ChartCanvas } from './ChartCanvas'

export interface SankeyChartProps
  extends CoreSankeyChartProps, Omit<HTMLAttributes<HTMLDivElement>, keyof CoreSankeyChartProps> {}

export function SankeyChart({
  nodes,
  links,
  width = 480,
  height = 280,
  padding = 16,
  title,
  desc,
  locale,
  labels: labelsOverride,
  className,
  responsive = true,
  ...rest
}: SankeyChartProps): ReactElement {
  const config = useTigerConfig()
  const mergedLocale = mergeTigerLocale(config.locale, locale)
  const labels = getChartLabels(mergedLocale, labelsOverride)
  const hostRef = useRef<HTMLDivElement>(null)
  const direction = readPageWritingDirection() === 'rtl' ? 'rtl' : 'ltr'
  const exportChart = () => {
    const svg = hostRef.current?.querySelector('svg')
    if (svg instanceof SVGSVGElement) downloadChartSvg(svg, 'sankey')
  }
  return (
    <div
      {...rest}
      ref={hostRef}
      className={getCartesianChartShellClasses({
        showLegend: false,
        responsive,
        className
      })}>
      <button
        type="button"
        className={resolveButtonClasses({ variant: 'outline', size: 'sm' })}
        onClick={exportChart}>
        {labels.exportText}
      </button>
      <ChartCanvas
        width={width}
        height={height}
        title={title}
        desc={desc}
        aria-label={rest['aria-label'] || (title ? undefined : labels.chartAriaLabel)}
        responsive={responsive}
        padding={padding}>
        {(ctx) => {
          const laid = layoutSankey(
            nodes,
            links,
            ctx.innerRect.width,
            ctx.innerRect.height,
            direction
          )
          return (
            <>
              {laid.links.map((link, index) => (
                <path
                  key={`link-${index}`}
                  data-sankey-link=""
                  d={link.path}
                  fill="none"
                  stroke="var(--tiger-primary, #2563eb)"
                  strokeWidth={link.width}
                  opacity={0.35}
                />
              ))}
              {laid.nodes.map((node) => (
                <rect
                  key={node.id}
                  data-sankey-node={node.id}
                  role="img"
                  aria-label={node.label}
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill="var(--tiger-primary, #2563eb)"
                />
              ))}
            </>
          )
        }}
      </ChartCanvas>
    </div>
  )
}

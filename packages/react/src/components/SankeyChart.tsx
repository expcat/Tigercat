import React, { useRef } from 'react'
import {
  downloadChartSvg,
  getW9DataLabels,
  layoutSankey,
  readPageWritingDirection,
  type SankeyChartProps as CoreSankeyChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'

export type SankeyChartProps = CoreSankeyChartProps

export function SankeyChart({
  nodes,
  links,
  width = 480,
  height = 280,
  title,
  className,
  responsive = true
}: SankeyChartProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const direction = readPageWritingDirection() === 'rtl' ? 'rtl' : 'ltr'
  const exportChart = () => {
    const svg = hostRef.current?.querySelector('svg')
    if (svg instanceof SVGSVGElement) downloadChartSvg(svg, 'sankey')
  }
  return (
    <div ref={hostRef} className={className}>
      <button type="button" onClick={exportChart}>
        {getW9DataLabels().exportChart}
      </button>
      <ChartCanvas width={width} height={height} title={title} responsive={responsive} padding={16}>
        {(ctx) => {
          const laid = layoutSankey(nodes, links, ctx.innerRect.width, ctx.innerRect.height, direction)
          return (
            <>
              {laid.links.map((link, index) => (
                <path
                  key={`link-${index}`}
                  data-sankey-link=""
                  d={link.path}
                  fill="var(--tiger-primary, #2563eb)"
                  opacity={0.35}
                />
              ))}
              {laid.nodes.map((node) => (
                <rect
                  key={node.id}
                  data-sankey-node={node.id}
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  fill="var(--tiger-text, #0f172a)"
                />
              ))}
            </>
          )
        }}
      </ChartCanvas>
    </div>
  )
}

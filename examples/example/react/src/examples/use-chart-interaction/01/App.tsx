import { useState } from 'react'
import { Card } from '@expcat/tigercat-react/Card'
import { ChartLegend } from '@expcat/tigercat-react/ChartLegend'
import { ChartTooltip } from '@expcat/tigercat-react/ChartTooltip'
import { useChartInteraction } from '@expcat/tigercat-react'

interface BarDatum {
  label: string
  value: number
  color: string
}

const data: BarDatum[] = [
  { label: 'A', value: 36, color: '#2563eb' },
  { label: 'B', value: 72, color: '#0ea5e9' },
  { label: 'C', value: 54, color: '#10b981' }
]

const max = Math.max(...data.map((d) => d.value))

export default function App() {
  const [lastClick, setLastClick] = useState('无')
  const click = useChartInteraction<BarDatum>({
    hoverable: false,
    selectable: false,
    showTooltip: true,
    activeOpacity: 1,
    inactiveOpacity: 0.35,
    getData: (i) => data[i],
    onClick: (_index, datum) => {
      setLastClick(datum?.label ?? '无')
    }
  })

  const selected = useChartInteraction<BarDatum>({
    hoverable: true,
    selectable: true,
    activeOpacity: 1,
    inactiveOpacity: 0.35,
    getData: (i) => data[i]
  })

  const hovered = click.resolvedHoveredIndex
  const tooltipContent = hovered == null ? '' : `${data[hovered]?.label}: ${data[hovered]?.value}`

  return (
    <>
      <Card>
        <p className="mb-2 text-sm text-[color:var(--tiger-text-secondary)]">
          不设 selectable 仍能 click；悬停只开 tooltip。上次点击：{lastClick}
        </p>
        <svg viewBox="0 0 280 160" className="h-40 w-full">
          {data.map((d, i) => (
            <rect
              key={d.label}
              x={20 + i * 80}
              y={160 - (d.value / max) * 120}
              width={50}
              height={(d.value / max) * 120}
              fill={d.color}
              rx={4}
              aria-label={`${d.label}: ${d.value}`}
              className="cursor-pointer"
              onMouseEnter={(e) => click.handleMouseEnter(i, e)}
              onMouseMove={click.handleMouseMove}
              onMouseLeave={click.handleMouseLeave}
              onClick={() => click.handleClick(i)}
            />
          ))}
        </svg>
        <ChartTooltip
          content={tooltipContent}
          open={hovered != null}
          x={click.tooltipPosition.x}
          y={click.tooltipPosition.y}
        />
      </Card>
      <Card>
        <p className="mb-2 text-sm text-[color:var(--tiger-text-secondary)]">
          图例 hover 与点选走同一套 hook。
        </p>
        <svg viewBox="0 0 280 160" className="h-40 w-full">
          {data.map((d, i) => (
            <rect
              key={d.label}
              x={20 + i * 80}
              y={160 - (d.value / max) * 120}
              width={50}
              height={(d.value / max) * 120}
              fill={d.color}
              opacity={selected.getElementOpacity(i)}
              rx={4}
              tabIndex={selected.resolvedSelectedIndex === i ? 0 : -1}
              role="button"
              aria-label={`${d.label}: ${d.value}`}
              className="cursor-pointer"
              onMouseEnter={(e) => selected.handleMouseEnter(i, e)}
              onMouseLeave={selected.handleMouseLeave}
              onClick={() => selected.handleClick(i)}
              onKeyDown={(e) => selected.handleKeyDown(e, i)}
            />
          ))}
        </svg>
        <ChartLegend
          items={data.map((d, i) => ({
            index: i,
            label: d.label,
            color: d.color,
            active: selected.activeIndex == null || selected.activeIndex === i,
            selected: selected.resolvedSelectedIndex === i
          }))}
          interactive
          onItemClick={selected.handleLegendClick}
          onItemHover={selected.handleLegendHover}
          onItemLeave={selected.handleLegendLeave}
        />
      </Card>
    </>
  )
}

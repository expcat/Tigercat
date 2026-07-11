import React from 'react'
import { Card } from '@expcat/tigercat-react/Card'
import { useChartInteraction } from '@expcat/tigercat-react'

interface BarDatum {
  label: string
  value: number
  color: string
}

const data: BarDatum[] = [
  { label: 'A', value: 36, color: '#2563eb' },
  { label: 'B', value: 72, color: '#0ea5e9' },
  { label: 'C', value: 54, color: '#10b981' },
  { label: 'D', value: 88, color: '#f59e0b' },
  { label: 'E', value: 42, color: '#ef4444' }
]

const max = Math.max(...data.map((d) => d.value))

export default function App() {
  const interaction = useChartInteraction<BarDatum>({
    hoverable: true,
    selectable: true,
    activeOpacity: 1,
    inactiveOpacity: 0.35,
    getData: (i) => data[i]
  })

  const activeLabel = interaction.activeIndex == null ? '无' : data[interaction.activeIndex]?.label

  const selectedLabel =
    interaction.resolvedSelectedIndex == null
      ? '无'
      : data[interaction.resolvedSelectedIndex]?.label

  return (
    <>
      <Card>
        <svg viewBox="0 0 400 200" className="w-full h-48">
          {data.map((d, i) => (
            <g key={d.label}>
              <rect
                x={20 + i * 70}
                y={200 - (d.value / max) * 160}
                width={50}
                height={(d.value / max) * 160}
                fill={d.color}
                opacity={interaction.getElementOpacity(i)}
                rx={4}
                tabIndex={0}
                role="button"
                aria-label={`${d.label}: ${d.value}`}
                className="cursor-pointer transition-opacity"
                onMouseEnter={(e) => interaction.handleMouseEnter(i, e)}
                onMouseLeave={interaction.handleMouseLeave}
                onClick={() => interaction.handleClick(i)}
                onKeyDown={(e) => interaction.handleKeyDown(e, i)}
              />
              <text x={45 + i * 70} y={195} textAnchor="middle" className="text-xs fill-gray-600">
                {d.label}
              </text>
            </g>
          ))}
        </svg>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div>
            当前悬停：<strong>{activeLabel}</strong>
          </div>
          <div>
            当前选中：<strong>{selectedLabel}</strong>
          </div>
        </div>
      </Card>
    </>
  )
}

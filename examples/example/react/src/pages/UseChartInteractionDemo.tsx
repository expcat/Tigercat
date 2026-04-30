import React from 'react'
import { useChartInteraction, Card } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

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

const snippet = `import { useChartInteraction } from '@expcat/tigercat-react'

const interaction = useChartInteraction<BarDatum>({
  hoverable: true,
  selectable: true,
  activeOpacity: 1,
  inactiveOpacity: 0.35,
  getData: (i) => data[i]
})

return (
  <svg>
    {data.map((d, i) => (
      <rect key={d.label}
            opacity={interaction.getElementOpacity(i)}
            onMouseEnter={(e) => interaction.handleMouseEnter(i, e)}
            onMouseLeave={interaction.handleMouseLeave}
            onClick={() => interaction.handleClick(i)}
            onKeyDown={(e) => interaction.handleKeyDown(e, i)} />
    ))}
  </svg>
)`

const UseChartInteractionDemo: React.FC = () => {
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
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">useChartInteraction 图表交互</h1>
        <p className="text-gray-600">
          统一管理图表的悬停高亮、选中态、键盘可达性与图例联动，被内置的 BarChart / LineChart
          等组件使用。
        </p>
      </div>

      <DemoBlock
        title="自定义柱状图"
        description="使用该 Hook 实现自定义图表的悬停高亮和点击选中。"
        code={snippet}>
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
      </DemoBlock>
    </div>
  )
}

export default UseChartInteractionDemo

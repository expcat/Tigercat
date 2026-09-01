import { ScatterChart } from '@expcat/tigercat-react/ScatterChart'
import type { ScatterChartDatum } from '@expcat/tigercat-react'

const data: ScatterChartDatum[] = [
  { x: 12, y: 2400, label: '华东', size: 120, color: '#2563eb' },
  { x: 28, y: 3600, label: '华南', size: 80, color: '#22c55e' },
  { x: 45, y: 2900, label: '华北', size: 200, color: '#f59e0b' },
  { x: 62, y: 4800, label: '西南', size: 40, color: '#ef4444' }
]

export default function App() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm text-gray-500">
          坐标轴标题 + 每个点一项图例。sizeScale 把 size 当度量，gradient 仍用 item.color
        </p>
        <ScatterChart
          data={data}
          width={460}
          height={260}
          xAxisLabel="门店数"
          yAxisLabel="销售额"
          xTicks={4}
          yTicks={4}
          yTickFormat={(value) => `${Number(value) / 1000}k`}
          sizeScale={{ minRadius: 5, maxRadius: 14 }}
          gradient
          showLegend
          legendPosition="bottom"
        />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">只传 onPointClick，不必再开 selectable</p>
        <ScatterChart
          data={data}
          width={460}
          height={220}
          onPointClick={(index, datum) => {
            console.info(index, datum.label)
          }}
        />
      </div>
    </div>
  )
}

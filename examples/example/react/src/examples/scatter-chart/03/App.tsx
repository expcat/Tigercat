import { ScatterChart } from '@expcat/tigercat-react/ScatterChart'
import type { ScatterChartDatum } from '@expcat/tigercat-react'

const data: ScatterChartDatum[] = [
  { x: 12, y: 2400, label: '华东' },
  { x: 28, y: 3600, label: '华南' },
  { x: 45, y: 2900, label: '华北' },
  { x: 62, y: 4800, label: '西南' }
]

export default function App() {
  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">坐标轴标题 + 刻度格式化 + 图例（colors 循环配色）</p>
      <ScatterChart
        data={data}
        width={460}
        height={260}
        colors={['#2563eb', '#22c55e', '#f59e0b', '#ef4444']}
        xAxisLabel="门店数"
        yAxisLabel="销售额"
        xTicks={4}
        yTicks={4}
        yTickFormat={(value) => `${Number(value) / 1000}k`}
        pointSize={9}
        showLegend
        legendPosition="bottom"
      />
    </div>
  )
}

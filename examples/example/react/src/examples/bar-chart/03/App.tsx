import { BarChart } from '@expcat/tigercat-react/BarChart'
import type { BarChartDatum } from '@expcat/tigercat-react'

const data: BarChartDatum[] = [
  { x: 'A', y: 45 },
  { x: 'B', y: 72 },
  { x: 'C', y: 38 },
  { x: 'D', y: 60 }
]

export default function App() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm text-gray-500">colors 循环配色 + 坐标轴标题</p>
        <BarChart
          data={data}
          width={420}
          height={220}
          colors={['#2563eb', '#22c55e', '#f59e0b', '#ef4444']}
          xAxisLabel="分组"
          yAxisLabel="数量"
        />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">barColor 单色 + barMaxWidth + barPaddingInner + 无网格</p>
        <BarChart
          data={data}
          width={420}
          height={200}
          barColor="#0891b2"
          barMaxWidth={28}
          barPaddingInner={0.5}
          showGrid={false}
        />
      </div>
    </div>
  )
}

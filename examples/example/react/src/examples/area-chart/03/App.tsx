import { AreaChart } from '@expcat/tigercat-react/AreaChart'
import type { AreaChartSeries } from '@expcat/tigercat-react'

const series: AreaChartSeries[] = [
  {
    name: '移动端',
    data: [
      { x: 'Q1', y: 40 },
      { x: 'Q2', y: 55 },
      { x: 'Q3', y: 60 },
      { x: 'Q4', y: 70 }
    ]
  },
  {
    name: '桌面端',
    data: [
      { x: 'Q1', y: 30 },
      { x: 'Q2', y: 35 },
      { x: 'Q3', y: 40 },
      { x: 'Q4', y: 45 }
    ]
  }
]

export default function App() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm text-gray-500">非堆叠多系列 + 坐标轴标题 + 刻度格式化</p>
        <AreaChart
          series={series}
          width={420}
          height={220}
          xAxisLabel="季度"
          yAxisLabel="占比"
          yTicks={4}
          yTickFormat={(value) => `${value}%`}
          gridLineStyle="dotted"
          showLegend
        />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">showGrid=false + showAxis=false（迷你趋势）</p>
        <AreaChart series={series} width={420} height={120} showGrid={false} showAxis={false} gradient />
      </div>
    </div>
  )
}

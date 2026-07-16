import { LineChart } from '@expcat/tigercat-react/LineChart'
import type { LineChartDatum } from '@expcat/tigercat-react'

const data: LineChartDatum[] = [
  { x: 'Jan', y: 820 },
  { x: 'Feb', y: 932 },
  { x: 'Mar', y: 901 },
  { x: 'Apr', y: 1290 },
  { x: 'May', y: 1330 }
]

export default function App() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm text-gray-500">坐标轴标题 + 刻度格式化 + 虚线网格</p>
        <LineChart
          data={data}
          width={420}
          height={220}
          xAxisLabel="月份"
          yAxisLabel="访问量"
          yTicks={4}
          yTickFormat={(value) => `${Number(value) / 1000}k`}
          gridLineStyle="dashed"
          includeZero
        />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">showGrid=false + showYAxis=false（极简折线）</p>
        <LineChart data={data} width={420} height={160} showGrid={false} showYAxis={false} />
      </div>
    </div>
  )
}

import { LineChart } from '@expcat/tigercat-react/LineChart'
import type { LineChartDatum } from '@expcat/tigercat-react'

const data: LineChartDatum[] = [
  { x: 'W1', y: 12 },
  { x: 'W2', y: 26 },
  { x: 'W3', y: 18 },
  { x: 'W4', y: 34 }
]

export default function App() {
  return (
    <div className="w-full max-w-xl">
      <p className="mb-1 text-sm text-gray-500">
        lineColor + strokeWidth + pointSize + 自定义提示 + responsive
      </p>
      <LineChart
        data={data}
        height={220}
        responsive
        lineColor="#7c3aed"
        strokeWidth={3}
        pointSize={6}
        showTooltip
        tooltipFormatter={(datum) => `${datum.x}：${datum.y} 单`}
      />
    </div>
  )
}

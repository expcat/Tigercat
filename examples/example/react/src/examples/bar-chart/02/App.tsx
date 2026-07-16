import { BarChart } from '@expcat/tigercat-react/BarChart'
import type { BarChartDatum } from '@expcat/tigercat-react'

const data: BarChartDatum[] = [
  { x: '一月', y: 3200 },
  { x: '二月', y: 4100 },
  { x: '三月', y: 2800 },
  { x: '四月', y: 5200 }
]

export default function App() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm text-gray-500">valueLabelPosition=&quot;top&quot; + 自定义标签格式</p>
        <BarChart
          data={data}
          width={420}
          height={220}
          showValueLabels
          valueLabelPosition="top"
          valueLabelFormatter={(datum) => `¥${(datum.y / 1000).toFixed(1)}k`}
        />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">valueLabelPosition=&quot;inside&quot; + 自定义提示</p>
        <BarChart
          data={data}
          width={420}
          height={220}
          showValueLabels
          valueLabelPosition="inside"
          showTooltip
          tooltipFormatter={(datum) => `${datum.x}：${datum.y} 元`}
        />
      </div>
    </div>
  )
}

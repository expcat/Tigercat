import { PieChart } from '@expcat/tigercat-react/PieChart'
import type { PieChartDatum } from '@expcat/tigercat-react'

const data: PieChartDatum[] = [
  { value: 45, label: '移动端' },
  { value: 30, label: '桌面端' },
  { value: 15, label: '平板' },
  { value: 10, label: '其他' }
]

export default function App() {
  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">colors 调色板 + 内部标签 + 自定义提示 + 渐变</p>
      <PieChart
        data={data}
        width={420}
        height={280}
        colors={['#2563eb', '#22c55e', '#f59e0b', '#94a3b8']}
        showLabels
        labelPosition="inside"
        labelFormatter={(value) => `${value}%`}
        showTooltip
        tooltipFormatter={(datum) => `${datum.label}：${datum.value}%`}
        gradient
        showLegend
        legendPosition="right"
      />
    </div>
  )
}

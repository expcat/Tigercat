import { DonutChart } from '@expcat/tigercat-react/DonutChart'
import type { PieChartDatum } from '@expcat/tigercat-react'

const data: PieChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' }
]

const total = data.reduce((sum, item) => sum + item.value, 0)
const percent = (value: number) => `${Math.round((value / total) * 100)}%`

export default function App() {
  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">外部标签 + 引导线 + 自定义标签/提示格式</p>
      <DonutChart
        data={data}
        width={420}
        height={280}
        innerRadiusRatio={0.6}
        showLabels
        labelPosition="outside"
        labelFormatter={(value) => percent(value)}
        showTooltip
        tooltipFormatter={(datum) => `${datum.label}：${datum.value}（${percent(datum.value)}）`}
        centerValue={percent(data[0].value)}
        centerLabel="直接访问占比"
      />
    </div>
  )
}

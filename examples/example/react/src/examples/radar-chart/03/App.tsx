import { RadarChart } from '@expcat/tigercat-react/RadarChart'
import type { RadarChartDatum } from '@expcat/tigercat-react'

const data: RadarChartDatum[] = [
  { label: '速度', value: 80 },
  { label: '稳定', value: 65 },
  { label: '设计', value: 90 },
  { label: '续航', value: 70 },
  { label: '价格', value: 50 }
]

export default function App() {
  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">labelFormatter + levelLabelFormatter + 自定义提示</p>
      <RadarChart
        data={data}
        width={380}
        height={300}
        maxValue={100}
        showLevelLabels
        levelLabelFormatter={(value) => `${value}分`}
        labelFormatter={(datum) => `${datum.label} ${datum.value}`}
        labelOffset={18}
        showTooltip
        tooltipFormatter={(datum) => `${datum.label}：${datum.value} 分`}
      />
    </div>
  )
}

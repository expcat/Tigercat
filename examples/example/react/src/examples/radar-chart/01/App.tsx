import { RadarChart } from '@expcat/tigercat-react/RadarChart'
import type { RadarChartSeries } from '@expcat/tigercat-react'

const series: RadarChartSeries[] = [
  {
    name: '产品 A',
    data: [
      { label: '速度', value: 80 },
      { label: '稳定', value: 65 },
      { label: '设计', value: 90 },
      { label: '续航', value: 70 },
      { label: '价格', value: 50 }
    ]
  },
  {
    name: '产品 B',
    data: [
      { label: '速度', value: 72 },
      { label: '稳定', value: 78 },
      { label: '设计', value: 82 },
      { label: '续航', value: 66 },
      { label: '价格', value: 60 }
    ]
  }
]

export default function App() {
  return (
    <RadarChart
      series={series}
      width={380}
      height={280}
      maxValue={100}
      gridShape="circle"
      showSplitArea
      showLevelLabels
      showPoints
      fillOpacity={0.18}
      hoverable
      selectable
      showLegend
      legendPosition="right"
    />
  )
}

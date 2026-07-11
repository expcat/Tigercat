import { LineChart } from '@expcat/tigercat-react/LineChart'
import type { LineChartSeries } from '@expcat/tigercat-react'

const series: LineChartSeries[] = [
  {
    name: '销售额',
    data: [
      { x: 'Q1', y: 120 },
      { x: 'Q2', y: 180 },
      { x: 'Q3', y: 150 },
      { x: 'Q4', y: 200 }
    ]
  },
  {
    name: '利润',
    data: [
      { x: 'Q1', y: 40 },
      { x: 'Q2', y: 60 },
      { x: 'Q3', y: 45 },
      { x: 'Q4', y: 80 }
    ],
    strokeDasharray: '5,3'
  }
]

export default function App() {
  return (
    <LineChart
      series={series}
      width={420}
      height={240}
      curve="monotone"
      showArea
      areaOpacity={0.2}
      showPoints
      pointHollow
      animated
      hoverable
      selectable
      showLegend
      legendPosition="right"
    />
  )
}

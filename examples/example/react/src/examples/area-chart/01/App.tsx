import { AreaChart } from '@expcat/tigercat-react/AreaChart'
import type { AreaChartSeries } from '@expcat/tigercat-react'

const series: AreaChartSeries[] = [
  {
    name: '移动端',
    data: [
      { x: 'Jan', y: 40 },
      { x: 'Feb', y: 55 },
      { x: 'Mar', y: 60 },
      { x: 'Apr', y: 70 }
    ]
  },
  {
    name: '桌面端',
    data: [
      { x: 'Jan', y: 30 },
      { x: 'Feb', y: 35 },
      { x: 'Mar', y: 40 },
      { x: 'Apr', y: 45 }
    ]
  }
]

export default function App() {
  return (
    <AreaChart
      series={series}
      width={420}
      height={240}
      stacked
      gradient
      curve="monotone"
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

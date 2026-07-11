import { BarChart } from '@expcat/tigercat-react/BarChart'
import type { BarChartDatum } from '@expcat/tigercat-react'

const data: BarChartDatum[] = [
  { x: 'Mon', y: 120 },
  { x: 'Tue', y: 200 },
  { x: 'Wed', y: 150 },
  { x: 'Thu', y: 80 },
  { x: 'Fri', y: 170 }
]

export default function App() {
  return (
    <BarChart
      data={data}
      width={420}
      height={240}
      responsive
      gradient
      animated
      barRadius={6}
      gridLineStyle="dashed"
      showValueLabels
      hoverable
      selectable
      showLegend
      showTooltip
    />
  )
}

import { PieChart } from '@expcat/tigercat-react/PieChart'
import type { PieChartDatum } from '@expcat/tigercat-react'

const data: PieChartDatum[] = [
  { value: 120, label: '移动端' },
  { value: 80, label: '桌面端' },
  { value: 40, label: '平板' },
  { value: 24, label: '其他' }
]

export default function App() {
  return (
    <PieChart
      data={data}
      width={420}
      height={280}
      showLabels
      labelPosition="inside"
      gradient
      showLegend
      legendPosition="right"
    />
  )
}

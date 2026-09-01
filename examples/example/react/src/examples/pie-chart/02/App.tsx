import { PieChart } from '@expcat/tigercat-react/PieChart'
import type { PieChartDatum } from '@expcat/tigercat-react'

const data: PieChartDatum[] = [
  { value: 40, label: '产品 A' },
  { value: 28, label: '产品 B' },
  { value: 22, label: '产品 C' },
  { value: 15, label: '产品 D' }
]

export default function App() {
  return (
    <PieChart
      data={data}
      width={440}
      height={320}
      startAngle={-Math.PI / 2}
      endAngle={Math.PI / 2}
      showLabels
      labelPosition="outside"
    />
  )
}

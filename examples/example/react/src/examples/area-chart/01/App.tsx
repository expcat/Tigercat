import { AreaChart } from '@expcat/tigercat-react/AreaChart'
import type { LineChartDatum } from '@expcat/tigercat-react'

const data: LineChartDatum[] = [
  { x: 'Jan', y: 40 },
  { x: 'Feb', y: 55 },
  { x: 'Mar', y: 60 },
  { x: 'Apr', y: 70 }
]

export default function App() {
  return <AreaChart data={data} width={420} height={240} />
}

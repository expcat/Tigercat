import { LineChart } from '@expcat/tigercat-react/LineChart'
import type { LineChartDatum } from '@expcat/tigercat-react'

const data: LineChartDatum[] = [
  { x: 'Q1', y: 120 },
  { x: 'Q2', y: 180 },
  { x: 'Q3', y: 150 },
  { x: 'Q4', y: 200 }
]

export default function App() {
  return <LineChart data={data} width={420} height={240} />
}

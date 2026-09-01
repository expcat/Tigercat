import { ScatterChart } from '@expcat/tigercat-react/ScatterChart'
import type { ScatterChartDatum } from '@expcat/tigercat-react'

const data: ScatterChartDatum[] = [
  { x: 10, y: 25, label: 'A' },
  { x: 25, y: 60, label: 'B' },
  { x: 40, y: 35, label: 'C' },
  { x: 55, y: 75, label: 'D' }
]

export default function App() {
  return <ScatterChart data={data} width={420} height={260} />
}

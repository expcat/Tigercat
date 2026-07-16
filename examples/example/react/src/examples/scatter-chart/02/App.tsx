import { ScatterChart } from '@expcat/tigercat-react/ScatterChart'
import type { ScatterChartDatum } from '@expcat/tigercat-react'

const data: ScatterChartDatum[] = [
  { x: 10, y: 25 },
  { x: 25, y: 60 },
  { x: 40, y: 35 },
  { x: 55, y: 75 },
  { x: 70, y: 50 }
]
const styles = ['circle', 'square', 'triangle'] as const

export default function App() {
  return (
    <div className="flex flex-wrap gap-4">
      {styles.map((pointStyle) => (
        <div key={pointStyle}>
          <p className="mb-1 text-sm text-gray-500">pointStyle=&quot;{pointStyle}&quot;</p>
          <ScatterChart
            data={data}
            width={240}
            height={180}
            pointStyle={pointStyle}
            pointSize={7}
            pointColor="#7c3aed"
            pointOpacity={0.8}
          />
        </div>
      ))}
    </div>
  )
}

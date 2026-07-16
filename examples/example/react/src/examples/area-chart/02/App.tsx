import { AreaChart } from '@expcat/tigercat-react/AreaChart'
import type { LineChartDatum } from '@expcat/tigercat-react'

const data: LineChartDatum[] = [
  { x: 'Jan', y: 40 },
  { x: 'Feb', y: 55 },
  { x: 'Mar', y: 60 },
  { x: 'Apr', y: 70 },
  { x: 'May', y: 65 }
]

export default function App() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-1 text-sm text-gray-500">data 单系列 + areaColor + fillOpacity</p>
        <AreaChart data={data} width={420} height={200} areaColor="#0891b2" fillOpacity={0.35} />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">showPoints=false + includeZero=false（紧凑基线）</p>
        <AreaChart data={data} width={420} height={200} showPoints={false} includeZero={false} />
      </div>
    </div>
  )
}

import { RadarChart } from '@expcat/tigercat-react/RadarChart'
import type { RadarChartDatum } from '@expcat/tigercat-react'

const data: RadarChartDatum[] = [
  { label: '速度', value: 80 },
  { label: '稳定', value: 65 },
  { label: '设计', value: 90 },
  { label: '续航', value: 70 },
  { label: '价格', value: 50 }
]

export default function App() {
  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <p className="mb-1 text-sm text-gray-500">data 单系列 + levels=4 + 多边形网格 + 虚线</p>
        <RadarChart
          data={data}
          width={300}
          height={240}
          maxValue={100}
          levels={4}
          gridShape="polygon"
          gridLineStyle="dashed"
          strokeColor="#7c3aed"
          fillColor="#7c3aed"
          fillOpacity={0.2}
          strokeWidth={2}
        />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">showGrid=false + showAxis=false（只留形状与标签）</p>
        <RadarChart
          data={data}
          width={300}
          height={240}
          maxValue={100}
          showGrid={false}
          showAxis={false}
        />
      </div>
    </div>
  )
}

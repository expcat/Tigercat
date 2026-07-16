import { PieChart } from '@expcat/tigercat-react/PieChart'
import type { PieChartDatum } from '@expcat/tigercat-react'

const data: PieChartDatum[] = [
  { value: 40, label: '产品 A', color: '#5470c6' },
  { value: 28, label: '产品 B', color: '#91cc75' },
  { value: 22, label: '产品 C', color: '#fac858' },
  { value: 15, label: '产品 D', color: '#ee6666' }
]

export default function App() {
  return (
    <div className="flex flex-wrap gap-4">
      <div>
        <p className="mb-1 text-sm text-gray-500">innerRadius + padAngle + 描边</p>
        <PieChart
          data={data}
          width={280}
          height={220}
          innerRadius={45}
          padAngle={0.04}
          borderWidth={2}
          borderColor="#ffffff"
        />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">startAngle/endAngle 半圆扇形</p>
        <PieChart
          data={data}
          width={280}
          height={220}
          startAngle={-Math.PI / 2}
          endAngle={Math.PI / 2}
          padAngle={0.02}
        />
      </div>
    </div>
  )
}

import { GaugeChart } from '@expcat/tigercat-react/GaugeChart'

const segments = [
  { range: [0, 40] as [number, number], color: '#ef4444' },
  { range: [40, 70] as [number, number], color: '#f59e0b' },
  { range: [70, 100] as [number, number], color: '#10b981' }
]

export default function App() {
  return (
    <GaugeChart
      value={82}
      width={320}
      height={220}
      label="健康指数"
      segments={segments}
      arcWidth={28}
      startAngle={180}
      endAngle={360}
      valueFormatter={(value) => `${value}%`}
    />
  )
}

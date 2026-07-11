import { FunnelChart } from '@expcat/tigercat-react/FunnelChart'

const data = [
  { label: '访问', value: 5000 },
  { label: '咨询', value: 3200 },
  { label: '意向', value: 1800 },
  { label: '成交', value: 800 },
  { label: '复购', value: 300 }
]

export default function App() {
  return (
    <FunnelChart
      data={data}
      width={500}
      height={220}
      direction="horizontal"
      pinch
      gap={4}
      colors={['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']}
      hoverable
      selectable
      showLegend
    />
  )
}

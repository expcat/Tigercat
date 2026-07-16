import { FunnelChart } from '@expcat/tigercat-react/FunnelChart'

const data = [
  { label: '访问', value: 5000 },
  { label: '咨询', value: 3200 },
  { label: '意向', value: 1800 },
  { label: '成交', value: 800 }
]

export default function App() {
  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">direction=&quot;vertical&quot;（默认）+ gradient + 提示</p>
      <FunnelChart
        data={data}
        width={420}
        height={280}
        direction="vertical"
        gradient
        gap={3}
        showTooltip
        showLegend
        legendPosition="bottom"
      />
    </div>
  )
}

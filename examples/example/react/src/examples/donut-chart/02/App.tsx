import { DonutChart } from '@expcat/tigercat-react/DonutChart'
import type { PieChartDatum } from '@expcat/tigercat-react'

const data: PieChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' }
]

export default function App() {
  return (
    <div>
      <p className="mb-1 text-sm text-gray-500">colors + animated + gradient + 描边</p>
      <DonutChart
        data={data}
        width={380}
        height={280}
        colors={['#2563eb', '#0891b2', '#22c55e', '#f59e0b']}
        animated
        gradient
        borderWidth={3}
        borderColor="#ffffff"
        showLegend
        legendPosition="right"
      />
    </div>
  )
}

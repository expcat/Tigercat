import { DonutChart } from '@expcat/tigercat-react/DonutChart'
import type { PieChartDatum } from '@expcat/tigercat-react'

const data: PieChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' }
]

const total = data.reduce((sum, item) => sum + item.value, 0)

export default function App() {
  return (
    <DonutChart
      data={data}
      width={380}
      height={280}
      innerRadiusRatio={0.5}
      padAngle={0.06}
      hoverOffset={14}
      hoverable
      selectable
      showLabels
      showLegend
      legendPosition="right"
      showTooltip
      centerValue={total}
      centerLabel="访问量"
    />
  )
}

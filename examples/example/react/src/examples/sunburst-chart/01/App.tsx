import { SunburstChart } from '@expcat/tigercat-react/SunburstChart'

const data = [
  {
    label: '亚洲',
    value: 60,
    children: [
      { label: '中国', value: 35 },
      { label: '日本', value: 15 },
      { label: '印度', value: 10 }
    ]
  },
  {
    label: '欧洲',
    value: 25,
    children: [
      { label: '德国', value: 12 },
      { label: '法国', value: 8 },
      { label: '英国', value: 5 }
    ]
  },
  { label: '美洲', value: 15 }
]

export default function App() {
  return (
    <SunburstChart
      data={data}
      width={380}
      height={380}
      innerRadiusRatio={0.3}
      showLabels
      colors={['#6366f1', '#ec4899', '#14b8a6', '#f59e0b']}
      hoverable
      selectable
      showLegend
    />
  )
}

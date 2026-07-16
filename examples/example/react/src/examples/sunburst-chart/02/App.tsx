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
    <div className="flex flex-wrap gap-4">
      <div>
        <p className="mb-1 text-sm text-gray-500">innerRadiusRatio=0 实心 + gradient + 提示</p>
        <SunburstChart
          data={data}
          width={320}
          height={320}
          innerRadiusRatio={0}
          gradient
          showTooltip
        />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">showLabels=false + 底部图例</p>
        <SunburstChart
          data={data}
          width={320}
          height={320}
          showLabels={false}
          showLegend
          legendPosition="bottom"
        />
      </div>
    </div>
  )
}

import { TreeMapChart } from '@expcat/tigercat-react/TreeMapChart'

const data = [
  {
    label: '前端',
    value: 50,
    children: [
      { label: 'Vue', value: 30 },
      { label: 'React', value: 20 }
    ]
  },
  {
    label: '后端',
    value: 30,
    children: [
      { label: 'Node', value: 15 },
      { label: 'Go', value: 15 }
    ]
  },
  { label: '运维', value: 20 }
]

export default function App() {
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm text-gray-500">gradient + minLabelSize + 提示</p>
        <TreeMapChart
          data={data}
          width={500}
          height={220}
          gap={3}
          gradient
          minLabelSize={12}
          showTooltip
        />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">showLabels=false + 底部图例</p>
        <TreeMapChart
          data={data}
          width={500}
          height={160}
          showLabels={false}
          showLegend
          legendPosition="bottom"
        />
      </div>
    </div>
  )
}

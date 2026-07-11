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
    <TreeMapChart
      data={data}
      width={500}
      height={300}
      gap={4}
      showLabels
      colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444']}
      hoverable
      selectable
      showLegend
    />
  )
}

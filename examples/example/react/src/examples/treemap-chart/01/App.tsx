import { TreeMapChart } from '@expcat/tigercat-react/TreeMapChart'

const flatData = [
  { label: '技术部', value: 40 },
  { label: '产品部', value: 25 },
  { label: '设计部', value: 15 },
  { label: '市场部', value: 12 },
  { label: '行政部', value: 8 }
]

const nestedData = [
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
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">扁平数据，自动分配颜色</p>
          <TreeMapChart data={flatData} width={500} height={300} hoverable showLegend />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">层级数据</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">children 嵌套结构</p>
          <TreeMapChart data={nestedData} width={500} height={300} hoverable />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义样式</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">gap、showLabels、颜色</p>
          <TreeMapChart
            data={flatData}
            width={500}
            height={300}
            gap={4}
            showLabels
            colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
            selectable
          />
        </section>
      </div>
    </>
  )
}

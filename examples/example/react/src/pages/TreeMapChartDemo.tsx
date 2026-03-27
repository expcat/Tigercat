import { TreeMapChart } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

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

const basicSnippet = `const data = [
  { label: '技术部', value: 40 },
  { label: '产品部', value: 25 },
  ...
]

<TreeMapChart data={data} width={500} height={300} hoverable showLegend />`

const nestedSnippet = `const data = [
  { label: '前端', value: 50, children: [
    { label: 'Vue', value: 30 }, { label: 'React', value: 20 }
  ]},
  ...
]

<TreeMapChart data={data} width={500} height={300} hoverable />`

const customSnippet = `<TreeMapChart
  data={data} width={500} height={300}
  gap={4} showLabels
  colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
  selectable />`

const TreeMapChartDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">TreeMapChart 矩形树图</h1>
      <p className="text-gray-500 mb-8">以嵌套矩形展示层级数据的占比关系。</p>

      <DemoBlock title="基础用法" description="扁平数据，自动分配颜色" code={basicSnippet}>
        <TreeMapChart data={flatData} width={500} height={300} hoverable showLegend />
      </DemoBlock>

      <DemoBlock title="层级数据" description="children 嵌套结构" code={nestedSnippet}>
        <TreeMapChart data={nestedData} width={500} height={300} hoverable />
      </DemoBlock>

      <DemoBlock title="自定义样式" description="gap、showLabels、颜色" code={customSnippet}>
        <TreeMapChart
          data={flatData}
          width={500}
          height={300}
          gap={4}
          showLabels
          colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
          selectable />
      </DemoBlock>
    </div>
  )
}

export default TreeMapChartDemo

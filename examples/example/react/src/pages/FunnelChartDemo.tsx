import { FunnelChart } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const funnelData = [
  { label: '访问', value: 5000 },
  { label: '咨询', value: 3200 },
  { label: '意向', value: 1800 },
  { label: '成交', value: 800 },
  { label: '复购', value: 300 }
]

const basicSnippet = `<FunnelChart data={data} width={400} height={280} hoverable showLegend />

const data = [
  { label: '访问', value: 5000 },
  { label: '咨询', value: 3200 },
  { label: '意向', value: 1800 },
  { label: '成交', value: 800 },
  { label: '复购', value: 300 }
]`

const horizontalSnippet = `<FunnelChart data={data} width={500} height={200} direction="horizontal" pinch hoverable />`

const customSnippet = `<FunnelChart
  data={data} width={400} height={280}
  colors={['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']}
  gap={4} hoverable selectable />`

const FunnelChartDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">FunnelChart 漏斗图</h1>
      <p className="text-gray-500 mb-8">展示数据从大到小递减的流程或转化率。</p>

      <DemoBlock title="基础用法" description="垂直漏斗，hoverable 启用悬停" code={basicSnippet}>
        <FunnelChart data={funnelData} width={400} height={280} hoverable showLegend />
      </DemoBlock>

      <DemoBlock title="水平方向 & 收尖" description="direction='horizontal'，pinch 收尖末端" code={horizontalSnippet}>
        <FunnelChart data={funnelData} width={500} height={200} direction="horizontal" pinch hoverable />
      </DemoBlock>

      <DemoBlock title="自定义颜色 & 间距" description="colors 调色板，gap 段间距" code={customSnippet}>
        <FunnelChart
          data={funnelData}
          width={400}
          height={280}
          colors={['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']}
          gap={4}
          hoverable
          selectable />
      </DemoBlock>
    </div>
  )
}

export default FunnelChartDemo

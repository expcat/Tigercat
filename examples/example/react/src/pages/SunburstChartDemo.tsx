import { SunburstChart } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const sunburstData = [
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

const basicSnippet = `const data = [
  { label: '亚洲', value: 60, children: [
    { label: '中国', value: 35 }, ...
  ]},
  ...
]

<SunburstChart data={data} width={360} height={360} hoverable showLegend />`

const donutSnippet = `<SunburstChart data={data} width={360} height={360} innerRadiusRatio={0.3} showLabels hoverable selectable />`

const colorSnippet = `<SunburstChart
  data={data} width={360} height={360}
  colors={['#6366f1', '#ec4899', '#14b8a6', '#f59e0b']} hoverable />`

const SunburstChartDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">SunburstChart 旭日图</h1>
      <p className="text-gray-500 mb-8">以多层同心弧展示层级数据结构。</p>

      <DemoBlock title="基础用法" description="层级数据自动展开为多层弧" code={basicSnippet}>
        <SunburstChart data={sunburstData} width={360} height={360} hoverable showLegend />
      </DemoBlock>

      <DemoBlock title="内径 & 标签" description="innerRadiusRatio 创建甜甜圈效果" code={donutSnippet}>
        <SunburstChart data={sunburstData} width={360} height={360} innerRadiusRatio={0.3} showLabels hoverable selectable />
      </DemoBlock>

      <DemoBlock title="自定义颜色" code={colorSnippet}>
        <SunburstChart
          data={sunburstData}
          width={360}
          height={360}
          colors={['#6366f1', '#ec4899', '#14b8a6', '#f59e0b']}
          hoverable />
      </DemoBlock>
    </div>
  )
}

export default SunburstChartDemo

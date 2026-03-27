import { GaugeChart } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const segments = [
  { range: [0, 40] as [number, number], color: '#ef4444' },
  { range: [40, 70] as [number, number], color: '#f59e0b' },
  { range: [70, 100] as [number, number], color: '#10b981' }
]

const basicSnippet = `<GaugeChart value={72} label="完成率" />
<GaugeChart value={35} max={50} label="得分" />`

const segmentsSnippet = `<GaugeChart
  value={82} width={320} height={220} label="健康指数"
  segments={[
    { range: [0, 40], color: '#ef4444' },
    { range: [40, 70], color: '#f59e0b' },
    { range: [70, 100], color: '#10b981' }
  ]}
  valueFormatter={(v) => v + '%'} />`

const arcSnippet = `<GaugeChart
  value={60} width={280} height={200}
  arcWidth={30} startAngle={180} endAngle={360}
  showTicks={false} color="#10b981" />`

const GaugeChartDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">GaugeChart 仪表盘</h1>
      <p className="text-gray-500 mb-8">环形仪表盘，展示单一指标的进度或状态。</p>

      <DemoBlock title="基础用法" description="value、min、max" code={basicSnippet}>
        <div className="flex gap-8 items-end">
          <GaugeChart value={72} label="完成率" />
          <GaugeChart value={35} max={50} label="得分" />
        </div>
      </DemoBlock>

      <DemoBlock title="颜色分段" description="segments 按区间着色" code={segmentsSnippet}>
        <GaugeChart
          value={82}
          width={320}
          height={220}
          label="健康指数"
          segments={segments}
          valueFormatter={(v) => v + '%'} />
      </DemoBlock>

      <DemoBlock title="自定义弧形" description="arcWidth、startAngle、endAngle" code={arcSnippet}>
        <GaugeChart
          value={60}
          width={280}
          height={200}
          arcWidth={30}
          startAngle={180}
          endAngle={360}
          showTicks={false}
          color="#10b981" />
      </DemoBlock>
    </div>
  )
}

export default GaugeChartDemo

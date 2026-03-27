import { useMemo } from 'react'
import { HeatmapChart } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const hours = ['上午', '下午', '晚上']

const basicSnippet = `const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const hours = ['上午', '下午', '晚上']
const data = days.flatMap((_, xi) =>
  hours.map((_, yi) => ({ x: xi, y: yi, value: Math.round(Math.random() * 100) }))
)

<HeatmapChart data={data} xLabels={days} yLabels={hours} width={500} height={280} hoverable />`

const customSnippet = `<HeatmapChart
  data={data} xLabels={days} yLabels={hours}
  width={500} height={280} showValues
  minColor="#fef3c7" maxColor="#dc2626" cellRadius={4} />`

const HeatmapChartDemo: React.FC = () => {
  const heatData = useMemo(
    () =>
      days.flatMap((_, xi) =>
        hours.map((_, yi) => ({
          x: xi,
          y: yi,
          value: Math.round(Math.random() * 100)
        }))
      ),
    []
  )

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">HeatmapChart 热力图</h1>
      <p className="text-gray-500 mb-8">矩阵热力图，用颜色深浅展示数据密度。</p>

      <DemoBlock title="基础用法" description="xLabels / yLabels 定义坐标轴" code={basicSnippet}>
        <HeatmapChart data={heatData} xLabels={days} yLabels={hours} width={500} height={280} hoverable />
      </DemoBlock>

      <DemoBlock title="显示数值 & 自定义颜色" description="showValues、minColor、maxColor" code={customSnippet}>
        <HeatmapChart
          data={heatData}
          xLabels={days}
          yLabels={hours}
          width={500}
          height={280}
          showValues
          minColor="#fef3c7"
          maxColor="#dc2626"
          cellRadius={4} />
      </DemoBlock>
    </div>
  )
}

export default HeatmapChartDemo

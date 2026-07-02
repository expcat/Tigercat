import { useMemo } from 'react'
import { HeatmapChart } from '@expcat/tigercat-react/HeatmapChart'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './HeatmapChartDemo.tsx?raw'

const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
const hours = ['上午', '下午', '晚上']

const HeatmapChartDemo: React.FC = () => {
  const heatData = useMemo(
    () =>
      days.flatMap((day) =>
        hours.map((hour) => ({
          x: day,
          y: hour,
          value: Math.round(Math.random() * 100)
        }))
      ),
    []
  )

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold mb-2">HeatmapChart 热力图</h1>
      <p className="text-gray-500 mb-8">矩阵热力图，用颜色深浅展示数据密度。</p>

      <DemoBlock
        title="组合展示"
        description="合并展示基础用法、显示数值 & 自定义颜色，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">xLabels / yLabels 定义坐标轴</p>
            <HeatmapChart
              data={heatData}
              xLabels={days}
              yLabels={hours}
              width={500}
              height={280}
              hoverable
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              显示数值 & 自定义颜色
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              showValues、minColor、maxColor
            </p>
            <HeatmapChart
              data={heatData}
              xLabels={days}
              yLabels={hours}
              width={500}
              height={280}
              showValues
              minColor="#fef3c7"
              maxColor="#dc2626"
              cellRadius={4}
            />
          </section>
        </div>
      </DemoBlock>
    </div>
  )
}

export default HeatmapChartDemo

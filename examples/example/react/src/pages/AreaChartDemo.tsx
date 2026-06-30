import React, { useState } from 'react'
import { AreaChart } from '@expcat/tigercat-react/AreaChart'
import { type LineChartDatum, type AreaChartSeries } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './AreaChartDemo.tsx?raw'

const basicData: LineChartDatum[] = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 40 },
  { x: 'Mar', y: 35 },
  { x: 'Apr', y: 50 },
  { x: 'May', y: 49 },
  { x: 'Jun', y: 60 }
]

const multiSeries: AreaChartSeries[] = [
  {
    name: '产品 A',
    data: [
      { x: 'Q1', y: 120 },
      { x: 'Q2', y: 180 },
      { x: 'Q3', y: 150 },
      { x: 'Q4', y: 200 }
    ],
    fillOpacity: 0.4
  },
  {
    name: '产品 B',
    data: [
      { x: 'Q1', y: 80 },
      { x: 'Q2', y: 100 },
      { x: 'Q3', y: 90 },
      { x: 'Q4', y: 130 }
    ],
    fillOpacity: 0.4
  }
]

const stackedSeries: AreaChartSeries[] = [
  {
    name: '移动端',
    data: [
      { x: 'Jan', y: 40 },
      { x: 'Feb', y: 55 },
      { x: 'Mar', y: 60 },
      { x: 'Apr', y: 70 }
    ]
  },
  {
    name: '桌面端',
    data: [
      { x: 'Jan', y: 30 },
      { x: 'Feb', y: 35 },
      { x: 'Mar', y: 40 },
      { x: 'Apr', y: 45 }
    ]
  },
  {
    name: '平板端',
    data: [
      { x: 'Jan', y: 20 },
      { x: 'Feb', y: 25 },
      { x: 'Mar', y: 22 },
      { x: 'Apr', y: 28 }
    ]
  }
]

const AreaChartDemo: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AreaChart 面积图</h1>
        <p className="text-gray-600 dark:text-gray-400">
          用于展示数据随时间变化的趋势，强调数量累积。
        </p>
      </div>

      <DemoBlock
        title="组合展示"
        description="合并展示基础用法、渐变填充 + 动画、多系列、堆叠面积图、交互功能，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">单系列面积图。</p>
            <AreaChart
              data={basicData}
              width={420}
              height={240}
              fillOpacity={0.3}
              xAxisLabel="Month"
              yAxisLabel="Value"
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              渐变填充 + 动画
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              渐变面积填充、曲线平滑、空心数据点与入场动画，对齐 ECharts 视觉效果。
            </p>
            <AreaChart
              data={basicData}
              width={420}
              height={240}
              gradient
              curve="monotone"
              showPoints
              pointHollow
              animated
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">多系列</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">多个系列对比。</p>
            <AreaChart series={multiSeries} width={420} height={240} hoverable showLegend />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">堆叠面积图</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              数据堆叠展示，适合展示部分与整体关系。
            </p>
            <AreaChart
              series={stackedSeries}
              width={420}
              height={240}
              stacked
              hoverable
              showLegend
              legendPosition="right"
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">交互功能</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              悬停高亮、点击选择、曲线平滑。
            </p>
            <div className="space-y-4">
              <AreaChart
                series={multiSeries}
                width={420}
                height={240}
                hoverable
                selectable
                showPoints
                showLegend
                curve="monotone"
                hoveredIndex={hoveredIndex}
                onHoveredIndexChange={setHoveredIndex}
              />
              <p className="text-sm text-gray-500">
                当前悬停: {hoveredIndex !== null ? multiSeries[hoveredIndex]?.name : '无'}
              </p>
            </div>
          </section>
        </div>
      </DemoBlock>
    </div>
  )
}

export default AreaChartDemo

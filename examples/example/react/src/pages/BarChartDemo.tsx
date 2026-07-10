import React, { useState } from 'react'
import { BarChart } from '@expcat/tigercat-react/BarChart'
import { type BarChartDatum } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './BarChartDemo.tsx?raw'

const basicData: BarChartDatum[] = [
  { x: 'Mon', y: 120 },
  { x: 'Tue', y: 200 },
  { x: 'Wed', y: 150 },
  { x: 'Thu', y: 80 },
  { x: 'Fri', y: 170 }
]

const coloredData: BarChartDatum[] = [
  { x: 'Q1', y: 320, color: '#2563eb' },
  { x: 'Q2', y: 280, color: '#22c55e' },
  { x: 'Q3', y: 360, color: '#f97316' },
  { x: 'Q4', y: 420, color: '#a855f7' }
]

const interactiveData: BarChartDatum[] = [
  { x: 'Jan', y: 180 },
  { x: 'Feb', y: 220 },
  { x: 'Mar', y: 190 },
  { x: 'Apr', y: 280 },
  { x: 'May', y: 250 },
  { x: 'Jun', y: 310 }
]

const smallValuesData: BarChartDatum[] = [
  { x: 'A', y: 500 },
  { x: 'B', y: 420 },
  { x: 'C', y: 2 },
  { x: 'D', y: 380 },
  { x: 'E', y: 0.5 }
]

const currencyFormat = (value: number | string) => `$${value}`

const BarChartDemo: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [clickedBar, setClickedBar] = useState('')

  const handleBarClick = (_index: number, datum: BarChartDatum) => {
    setClickedBar(`点击了 ${datum.x}，值为 ${datum.y}`)
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">BarChart 柱状图</h1>
        <p className="text-gray-600 dark:text-gray-400">
          用于展示分类数据的柱状图，支持渐变填充、数值标签、入场动画等 ECharts 风格特性。
        </p>
      </div>

      <DemoBlock
        title="组合展示"
        description="合并展示基础用法、渐变填充 + 动画、自定义样式、数值标签、柱宽/柱高约束、悬停高亮、点击选中、显示图例、显示提示框，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              自动生成坐标轴与网格；responsive 会让图表跟随容器宽度，适配移动端。
            </p>
            <div className="h-[240px] w-full max-w-[420px]">
              <BarChart
                data={basicData}
                width={420}
                height={240}
                responsive
                xAxisLabel="Weekday"
                yAxisLabel="Sales"
              />
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              渐变填充 + 动画
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              启用 gradient 渐变与 animated 平滑过渡，配合数值标签。
            </p>
            <BarChart
              data={interactiveData}
              width={420}
              height={240}
              gradient
              animated
              barRadius={6}
              gridLineStyle="dashed"
              showValueLabels
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义样式</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">自定义颜色、圆角与刻度格式。</p>
            <BarChart
              data={coloredData}
              width={420}
              height={240}
              barRadius={6}
              gridLineStyle="dashed"
              yTickFormat={currencyFormat}
              showXAxis={false}
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">数值标签</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              showValueLabels 在柱子上方或内部显示数值。
            </p>
            <BarChart
              data={basicData}
              width={420}
              height={240}
              showValueLabels
              valueLabelPosition="top"
              gradient
              barRadius={6}
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              柱宽/柱高约束
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              barMaxWidth 限制最大柱宽，barMinHeight 保证微小值可见。
            </p>
            <BarChart
              data={smallValuesData}
              width={420}
              height={240}
              barMinHeight={3}
              barMaxWidth={40}
              gradient
              showValueLabels
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">悬停高亮</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              启用 hoverable 后，鼠标悬停时高亮柱子，其余淡出。
            </p>
            <div className="space-y-4">
              <BarChart
                data={interactiveData}
                width={420}
                height={240}
                hoverable
                gradient
                hoveredIndex={hoveredIndex}
                onHoveredIndexChange={setHoveredIndex}
              />
              <p className="text-sm text-gray-500">
                当前悬停: {hoveredIndex !== null ? interactiveData[hoveredIndex]?.x : '无'}
              </p>
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">点击选中</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              启用 selectable 后，点击可选中柱子，支持事件回调。
            </p>
            <div className="space-y-4">
              <BarChart
                data={interactiveData}
                width={420}
                height={240}
                hoverable
                selectable
                gradient
                selectedIndex={selectedIndex}
                onSelectedIndexChange={setSelectedIndex}
                onBarClick={handleBarClick}
              />
              <p className="text-sm text-gray-500">
                选中: {selectedIndex !== null ? interactiveData[selectedIndex]?.x : '无'}
                {clickedBar && <span className="ml-4">{clickedBar}</span>}
              </p>
            </div>
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">显示图例</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              通过 showLegend 显示图例，可设置位置。
            </p>
            <BarChart
              data={coloredData}
              width={420}
              height={240}
              hoverable
              showLegend
              legendPosition="right"
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">显示提示框</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              通过 showTooltip 在悬停时显示数据提示。
            </p>
            <BarChart
              data={interactiveData}
              width={420}
              height={240}
              hoverable
              showTooltip
              gradient
            />
          </section>
        </div>
      </DemoBlock>
    </div>
  )
}

export default BarChartDemo

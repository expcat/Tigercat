import React, { useState } from 'react'
import { BarChart, type BarChartDatum } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

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

const currencyFormat = (value: number | string) => `$${value}`

const basicSnippet = `<BarChart
  data={data}
  width={420}
  height={240}
  xAxisLabel="Weekday"
  yAxisLabel="Sales"
/>`

const customSnippet = `<BarChart
  data={coloredData}
  width={420}
  height={240}
  barRadius={6}
  gridLineStyle="dashed"
  yTickFormat={(value) => \`$\${value}\`}
  showXAxis={false}
/>`

const hoverableSnippet = `<BarChart
  data={data}
  width={420}
  height={240}
  hoverable
  hoveredIndex={hoveredIndex}
  onHoveredIndexChange={setHoveredIndex}
/>`

const selectableSnippet = `<BarChart
  data={data}
  width={420}
  height={240}
  hoverable
  selectable
  selectedIndex={selectedIndex}
  onSelectedIndexChange={setSelectedIndex}
  onBarClick={handleBarClick}
/>`

const legendSnippet = `<BarChart
  data={data}
  width={420}
  height={240}
  hoverable
  showLegend
  legendPosition="right"
/>`

const tooltipSnippet = `<BarChart
  data={data}
  width={420}
  height={240}
  hoverable
  showTooltip
/>`

const BarChartDemo: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [clickedBar, setClickedBar] = useState('')

  const handleBarClick = (datum: BarChartDatum, index: number) => {
    setClickedBar(`点击了 ${datum.x}，值为 ${datum.y}`)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">BarChart 柱状图</h1>
        <p className="text-gray-600">用于展示分类数据的柱状图。</p>
      </div>

      <DemoBlock title="基础用法" description="自动生成坐标轴与网格。" code={basicSnippet}>
        <BarChart
          data={basicData}
          width={420}
          height={240}
          xAxisLabel="Weekday"
          yAxisLabel="Sales"
        />
      </DemoBlock>

      <DemoBlock title="自定义样式" description="自定义颜色、圆角与刻度格式。" code={customSnippet}>
        <BarChart
          data={coloredData}
          width={420}
          height={240}
          barRadius={6}
          gridLineStyle="dashed"
          yTickFormat={currencyFormat}
          showXAxis={false}
        />
      </DemoBlock>

      <DemoBlock
        title="悬停高亮"
        description="启用 hoverable 后，鼠标悬停时高亮柱子。"
        code={hoverableSnippet}>
        <div className="space-y-4">
          <BarChart
            data={interactiveData}
            width={420}
            height={240}
            hoverable
            hoveredIndex={hoveredIndex}
            onHoveredIndexChange={setHoveredIndex}
          />
          <p className="text-sm text-gray-500">
            当前悬停: {hoveredIndex !== null ? interactiveData[hoveredIndex]?.x : '无'}
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="点击选中"
        description="启用 selectable 后，点击可选中柱子，支持事件回调。"
        code={selectableSnippet}>
        <div className="space-y-4">
          <BarChart
            data={interactiveData}
            width={420}
            height={240}
            hoverable
            selectable
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
            onBarClick={handleBarClick}
          />
          <p className="text-sm text-gray-500">
            选中: {selectedIndex !== null ? interactiveData[selectedIndex]?.x : '无'}
            {clickedBar && <span className="ml-4">{clickedBar}</span>}
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="显示图例"
        description="通过 showLegend 显示图例，可设置位置。"
        code={legendSnippet}>
        <BarChart
          data={coloredData}
          width={420}
          height={240}
          hoverable
          showLegend
          legendPosition="right"
        />
      </DemoBlock>

      <DemoBlock
        title="显示提示框"
        description="通过 showTooltip 在悬停时显示数据提示。"
        code={tooltipSnippet}>
        <BarChart data={interactiveData} width={420} height={240} hoverable showTooltip />
      </DemoBlock>
    </div>
  )
}

export default BarChartDemo

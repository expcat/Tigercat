import React, { useState } from 'react'
import { LineChart, type LineChartDatum, type LineChartSeries } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicData: LineChartDatum[] = [
  { x: 'Jan', y: 30 },
  { x: 'Feb', y: 40 },
  { x: 'Mar', y: 35 },
  { x: 'Apr', y: 50 },
  { x: 'May', y: 49 },
  { x: 'Jun', y: 60 }
]

const multiSeries: LineChartSeries[] = [
  {
    name: '销售额',
    data: [
      { x: 'Q1', y: 120 },
      { x: 'Q2', y: 180 },
      { x: 'Q3', y: 150 },
      { x: 'Q4', y: 200 }
    ]
  },
  {
    name: '利润',
    data: [
      { x: 'Q1', y: 40 },
      { x: 'Q2', y: 60 },
      { x: 'Q3', y: 45 },
      { x: 'Q4', y: 80 }
    ],
    strokeDasharray: '5,3'
  }
]

const basicSnippet = `<LineChart
  data={data}
  width={420}
  height={240}
  showPoints
  xAxisLabel="Month"
  yAxisLabel="Value"
/>`

const multiSeriesSnippet = `<LineChart
  series={multiSeries}
  width={420}
  height={240}
  hoverable
  showLegend
  showPoints
/>`

const curveSnippet = `<LineChart
  data={data}
  width={420}
  height={240}
  curve="monotone"
  showPoints
  showArea
/>`

const areaGradientSnippet = `<LineChart
  series={multiSeries}
  width={420}
  height={240}
  showArea
  areaOpacity={0.2}
  pointHollow
  showPoints
  curve="monotone"
  showLegend
/>`

const animatedSnippet = `<LineChart
  data={data}
  width={420}
  height={240}
  animated
  showArea
  curve="monotone"
  showPoints
  pointHollow
/>`

const interactiveSnippet = `<LineChart
  series={multiSeries}
  width={420}
  height={240}
  hoverable
  selectable
  showLegend
  legendPosition="right"
  showPoints
  hoveredIndex={hoveredIndex}
  onHoveredIndexChange={setHoveredIndex}
/>`

const LineChartDemo: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LineChart 折线图</h1>
        <p className="text-gray-600">用于展示数据随时间或类别变化趋势。</p>
      </div>

      <DemoBlock title="基础用法" description="单系列折线图，显示数据点。" code={basicSnippet}>
        <LineChart
          data={basicData}
          width={420}
          height={240}
          showPoints
          xAxisLabel="Month"
          yAxisLabel="Value"
        />
      </DemoBlock>

      <DemoBlock
        title="多系列"
        description="多条折线对比，支持虚线样式。"
        code={multiSeriesSnippet}>
        <LineChart series={multiSeries} width={420} height={240} hoverable showLegend showPoints />
      </DemoBlock>

      <DemoBlock
        title="曲线插值 + 面积填充"
        description="使用 monotone 平滑曲线并显示渐变面积。"
        code={curveSnippet}>
        <LineChart data={basicData} width={420} height={240} curve="monotone" showPoints showArea />
      </DemoBlock>

      <DemoBlock
        title="面积渐变 + 空心圆点"
        description="ECharts 风格：渐变填充区域、空心数据点、平滑曲线。"
        code={areaGradientSnippet}>
        <LineChart
          series={multiSeries}
          width={420}
          height={240}
          showArea
          areaOpacity={0.2}
          pointHollow
          showPoints
          curve="monotone"
          showLegend
        />
      </DemoBlock>

      <DemoBlock
        title="入场动画"
        description="线条从左到右绘制的入场动画效果。"
        code={animatedSnippet}>
        <LineChart
          data={basicData}
          width={420}
          height={240}
          animated
          showArea
          curve="monotone"
          showPoints
          pointHollow
        />
      </DemoBlock>

      <DemoBlock
        title="交互功能"
        description="悬停高亮、点击选择、图例联动。"
        code={interactiveSnippet}>
        <div className="space-y-4">
          <LineChart
            series={multiSeries}
            width={420}
            height={240}
            hoverable
            selectable
            showLegend
            legendPosition="right"
            showPoints
            hoveredIndex={hoveredIndex}
            onHoveredIndexChange={setHoveredIndex}
          />
          <p className="text-sm text-gray-500">
            当前悬停: {hoveredIndex !== null ? multiSeries[hoveredIndex]?.name : '无'}
          </p>
        </div>
      </DemoBlock>
    </div>
  )
}

export default LineChartDemo

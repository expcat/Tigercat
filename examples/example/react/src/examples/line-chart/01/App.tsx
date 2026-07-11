import React, { useState } from 'react'
import { LineChart } from '@expcat/tigercat-react/LineChart'
import { type LineChartDatum, type LineChartSeries } from '@expcat/tigercat-react'

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

export default function App() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">单系列折线图，显示数据点。</p>
          <LineChart
            data={basicData}
            width={420}
            height={240}
            showPoints
            xAxisLabel="Month"
            yAxisLabel="Value"
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">多系列</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">多条折线对比，支持虚线样式。</p>
          <LineChart
            series={multiSeries}
            width={420}
            height={240}
            hoverable
            showLegend
            showPoints
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            曲线插值 + 面积填充
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            使用 monotone 平滑曲线并显示渐变面积。
          </p>
          <LineChart
            data={basicData}
            width={420}
            height={240}
            curve="monotone"
            showPoints
            showArea
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            面积渐变 + 空心圆点
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            ECharts 风格：渐变填充区域、空心数据点、平滑曲线。
          </p>
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
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">入场动画</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            线条从左到右绘制的入场动画效果。
          </p>
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
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">交互功能</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">悬停高亮、点击选择、图例联动。</p>
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
        </section>
      </div>
    </>
  )
}

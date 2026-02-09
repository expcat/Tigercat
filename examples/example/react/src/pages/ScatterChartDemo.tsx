import React, { useState } from 'react'
import { ScatterChart, type ScatterChartDatum } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicData: ScatterChartDatum[] = [
  { x: 10, y: 20 },
  { x: 30, y: 80 },
  { x: 50, y: 40 },
  { x: 70, y: 60 },
  { x: 20, y: 55 },
  { x: 60, y: 30 },
  { x: 45, y: 70 }
]

const customData: ScatterChartDatum[] = [
  { x: 5, y: 30, size: 8, color: '#2563eb' },
  { x: 15, y: 10, size: 10, color: '#22c55e' },
  { x: 25, y: 80, size: 12, color: '#f97316' },
  { x: 35, y: 50, size: 14, color: '#a855f7' },
  { x: 45, y: 65, size: 9, color: '#0ea5e9' },
  { x: 55, y: 20, size: 11, color: '#ef4444' }
]

const interactiveData: ScatterChartDatum[] = [
  { x: 10, y: 25, label: 'Point A' },
  { x: 25, y: 60, label: 'Point B' },
  { x: 40, y: 35, label: 'Point C' },
  { x: 55, y: 75, label: 'Point D' },
  { x: 70, y: 45, label: 'Point E' },
  { x: 85, y: 55, label: 'Point F' }
]

const basicSnippet = `<ScatterChart
  data={data}
  width={420}
  height={260}
  xAxisLabel="X"
  yAxisLabel="Y"
/>`

const customSnippet = `<ScatterChart
  data={customData}
  width={420}
  height={260}
  includeZero
  gridLineStyle="dotted"
  hoverable
/>`

const animatedSnippet = `<ScatterChart
  data={data}
  width={420}
  height={260}
  animated
  hoverable
/>`

const hoverableSnippet = `<ScatterChart
  data={data}
  width={420}
  height={260}
  hoverable
  selectable
  hoveredIndex={hoveredIndex}
  onHoveredIndexChange={setHoveredIndex}
  selectedIndex={selectedIndex}
  onSelectedIndexChange={setSelectedIndex}
/>`

const diamondSnippet = `<ScatterChart
  data={data}
  width={420}
  height={260}
  pointStyle="diamond"
  pointSize={8}
  hoverable
/>`

const flatSnippet = `<ScatterChart
  data={data}
  width={420}
  height={260}
  gradient
  pointBorderWidth={1.5}
  hoverable
  showTooltip
/>`

const ScatterChartDemo: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ScatterChart 散点图</h1>
        <p className="text-gray-600">
          用于展示二维数值分布，默认扁平风格，可选渐变填充与入场动画。
        </p>
      </div>

      <DemoBlock title="基础用法" description="默认扁平纯色填充，简洁朴素。" code={basicSnippet}>
        <ScatterChart data={basicData} width={420} height={260} xAxisLabel="X" yAxisLabel="Y" />
      </DemoBlock>

      <DemoBlock
        title="自定义样式"
        description="通过 datum.size / datum.color 控制每个点的样式。"
        code={customSnippet}>
        <ScatterChart
          data={customData}
          width={420}
          height={260}
          includeZero
          gridLineStyle="dotted"
          hoverable
        />
      </DemoBlock>

      <DemoBlock
        title="入场动画"
        description="启用 animated 后数据点依次弹入。"
        code={animatedSnippet}>
        <ScatterChart data={interactiveData} width={420} height={260} animated hoverable />
      </DemoBlock>

      <DemoBlock
        title="悬停 + 选中"
        description="悬停时数据点放大高亮，支持点击选中。"
        code={hoverableSnippet}>
        <div className="space-y-4">
          <ScatterChart
            data={interactiveData}
            width={420}
            height={260}
            hoverable
            selectable
            hoveredIndex={hoveredIndex}
            onHoveredIndexChange={setHoveredIndex}
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
          />
          <p className="text-sm text-gray-500">
            悬停: {hoveredIndex !== null ? interactiveData[hoveredIndex]?.label : '无'}
            {' · '}
            选中: {selectedIndex !== null ? interactiveData[selectedIndex]?.label : '无'}
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="菱形散点"
        description="通过 pointStyle 切换形状，diamond / square / triangle 均可用。"
        code={diamondSnippet}>
        <ScatterChart
          data={interactiveData}
          width={420}
          height={260}
          pointStyle="diamond"
          pointSize={8}
          hoverable
        />
      </DemoBlock>

      <DemoBlock
        title="渐变风格"
        description="启用 gradient 与 pointBorderWidth 呈现立体效果。"
        code={flatSnippet}>
        <ScatterChart
          data={basicData}
          width={420}
          height={260}
          gradient
          pointBorderWidth={1.5}
          hoverable
          showTooltip
        />
      </DemoBlock>
    </div>
  )
}

export default ScatterChartDemo

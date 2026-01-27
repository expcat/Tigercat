import React, { useState } from 'react'
import { DonutChart, type DonutChartDatum } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicData: DonutChartDatum[] = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]

const interactiveData: DonutChartDatum[] = [
  { value: 35, label: '产品 A', color: '#2563eb' },
  { value: 28, label: '产品 B', color: '#22c55e' },
  { value: 22, label: '产品 C', color: '#f97316' },
  { value: 15, label: '产品 D', color: '#a855f7' }
]

const donutSnippet = `<DonutChart
  data={data}
  width={320}
  height={220}
  innerRadiusRatio={0.55}
  padAngle={0.02}
  showLabels
/>`

const hoverableSnippet = `<DonutChart
  data={data}
  width={320}
  height={220}
  hoverable
  showLabels
  hoveredIndex={hoveredIndex}
  onHoveredIndexChange={setHoveredIndex}
/>`

const selectableSnippet = `<DonutChart
  data={data}
  width={320}
  height={220}
  hoverable
  selectable
  showLabels
  selectedIndex={selectedIndex}
  onSelectedIndexChange={setSelectedIndex}
/>`

const legendSnippet = `<DonutChart
  data={data}
  width={320}
  height={220}
  hoverable
  showLegend
  legendPosition="right"
/>`

const tooltipSnippet = `<DonutChart
  data={data}
  width={320}
  height={220}
  hoverable
  showTooltip
  showLabels
/>`

const DonutChartDemo: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DonutChart 环形图</h1>
        <p className="text-gray-600">用于展示分类占比的环形图。</p>
      </div>

      <DemoBlock title="基础用法" description="默认环形图与标签。" code={donutSnippet}>
        <DonutChart
          data={basicData}
          width={320}
          height={220}
          innerRadiusRatio={0.55}
          padAngle={0.02}
          showLabels
        />
      </DemoBlock>

      <DemoBlock
        title="悬停高亮"
        description="启用 hoverable 后，鼠标悬停时高亮扇区。"
        code={hoverableSnippet}>
        <div className="space-y-4">
          <DonutChart
            data={interactiveData}
            width={320}
            height={220}
            hoverable
            showLabels
            hoveredIndex={hoveredIndex}
            onHoveredIndexChange={setHoveredIndex}
          />
          <p className="text-sm text-gray-500">
            当前悬停: {hoveredIndex !== null ? interactiveData[hoveredIndex]?.label : '无'}
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="点击选中"
        description="启用 selectable 后，点击可选中扇区。"
        code={selectableSnippet}>
        <div className="space-y-4">
          <DonutChart
            data={interactiveData}
            width={320}
            height={220}
            hoverable
            selectable
            showLabels
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
          />
          <p className="text-sm text-gray-500">
            选中: {selectedIndex !== null ? interactiveData[selectedIndex]?.label : '无'}
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="显示图例"
        description="通过 showLegend 显示图例，可设置位置。"
        code={legendSnippet}>
        <DonutChart
          data={interactiveData}
          width={320}
          height={220}
          hoverable
          showLegend
          legendPosition="right"
        />
      </DemoBlock>

      <DemoBlock
        title="显示提示框"
        description="通过 showTooltip 在悬停时显示数据提示。"
        code={tooltipSnippet}>
        <DonutChart
          data={interactiveData}
          width={320}
          height={220}
          hoverable
          showTooltip
          showLabels
        />
      </DemoBlock>
    </div>
  )
}

export default DonutChartDemo

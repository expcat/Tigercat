import React, { useState } from 'react'
import { PieChart, type PieChartDatum } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicData: PieChartDatum[] = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]

const interactiveData: PieChartDatum[] = [
  { value: 35, label: '产品 A', color: '#2563eb' },
  { value: 28, label: '产品 B', color: '#22c55e' },
  { value: 22, label: '产品 C', color: '#f97316' },
  { value: 15, label: '产品 D', color: '#a855f7' }
]

const basicSnippet = `<PieChart
  data={data}
  width={320}
  height={220}
  showLabels
/>`

const hoverableSnippet = `<PieChart
  data={data}
  width={320}
  height={220}
  hoverable
  showLabels
  hoveredIndex={hoveredIndex}
  onHoveredIndexChange={setHoveredIndex}
/>`

const selectableSnippet = `<PieChart
  data={data}
  width={320}
  height={220}
  hoverable
  selectable
  showLabels
  selectedIndex={selectedIndex}
  onSelectedIndexChange={setSelectedIndex}
  onSliceClick={handleSliceClick}
/>`

const legendSnippet = `<PieChart
  data={data}
  width={320}
  height={220}
  hoverable
  showLegend
  legendPosition="right"
/>`

const tooltipSnippet = `<PieChart
  data={data}
  width={320}
  height={220}
  hoverable
  showTooltip
  showLabels
/>`

const PieChartDemo: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [clickedSlice, setClickedSlice] = useState('')

  const handleSliceClick = (datum: PieChartDatum, index: number) => {
    setClickedSlice(`点击了 ${datum.label}，占比 ${datum.value}%`)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PieChart 饼图</h1>
        <p className="text-gray-600">用于展示分类占比。</p>
      </div>

      <DemoBlock title="基础用法" description="默认饼图与标签。" code={basicSnippet}>
        <PieChart data={basicData} width={320} height={220} showLabels />
      </DemoBlock>

      <DemoBlock
        title="悬停高亮"
        description="启用 hoverable 后，鼠标悬停时高亮扇区。"
        code={hoverableSnippet}>
        <div className="space-y-4">
          <PieChart
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
        description="启用 selectable 后，点击可选中扇区，支持事件回调。"
        code={selectableSnippet}>
        <div className="space-y-4">
          <PieChart
            data={interactiveData}
            width={320}
            height={220}
            hoverable
            selectable
            showLabels
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
            onSliceClick={handleSliceClick}
          />
          <p className="text-sm text-gray-500">
            选中: {selectedIndex !== null ? interactiveData[selectedIndex]?.label : '无'}
            {clickedSlice && <span className="ml-4">{clickedSlice}</span>}
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="显示图例"
        description="通过 showLegend 显示图例，可设置位置。"
        code={legendSnippet}>
        <PieChart
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
        <PieChart
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

export default PieChartDemo

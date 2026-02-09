import React, { useState } from 'react'
import { PieChart, type PieChartDatum } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const salesData: PieChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' },
  { value: 148, label: '搜索引擎' }
]

const colorfulData: PieChartDatum[] = [
  { value: 40, label: '产品 A', color: '#5470c6' },
  { value: 28, label: '产品 B', color: '#91cc75' },
  { value: 22, label: '产品 C', color: '#fac858' },
  { value: 15, label: '产品 D', color: '#ee6666' },
  { value: 12, label: '产品 E', color: '#73c0de' }
]

const basicSnippet = `<PieChart
  data={data}
  width={380}
  height={280}
  showLabels
/>`

const hoverSnippet = `<PieChart
  data={data}
  width={380}
  height={280}
  hoverable
  shadow
  hoveredIndex={hoveredIndex}
  onHoveredIndexChange={setHoveredIndex}
/>`

const outsideSnippet = `<PieChart
  data={data}
  width={440}
  height={320}
  showLabels
  labelPosition="outside"
  hoverable
  shadow
/>`

const selectableSnippet = `<PieChart
  data={data}
  width={380}
  height={280}
  hoverable
  selectable
  shadow
  showLegend
  legendPosition="right"
  selectedIndex={selectedIndex}
  onSelectedIndexChange={setSelectedIndex}
  onSliceClick={handleSliceClick}
/>`

const fullSnippet = `<PieChart
  data={data}
  width={480}
  height={340}
  hoverable
  shadow
  showLabels
  labelPosition="outside"
  showLegend
  legendPosition="right"
  showTooltip
/>`

const PieChartDemo: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [clickedSlice, setClickedSlice] = useState('')

  const handleSliceClick = (_index: number, datum: PieChartDatum) => {
    setClickedSlice(`点击了 ${datum.label}，值 ${datum.value}`)
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PieChart 饼图</h1>
        <p className="text-gray-600">
          ECharts 风格饼图：悬停偏移、边框分隔、外部标签引导线、阴影等特效。
        </p>
      </div>

      <DemoBlock
        title="基础饼图"
        description="自带 2px 白色边框分隔扇区，视觉更清晰。"
        code={basicSnippet}>
        <PieChart data={salesData} width={380} height={280} showLabels />
      </DemoBlock>

      <DemoBlock
        title="悬停偏移 + 阴影"
        description="hoverable + shadow 模拟 ECharts emphasis 效果：悬停时扇区向外偏移并附带阴影。"
        code={hoverSnippet}>
        <div className="space-y-4">
          <PieChart
            data={colorfulData}
            width={380}
            height={280}
            hoverable
            shadow
            hoveredIndex={hoveredIndex}
            onHoveredIndexChange={setHoveredIndex}
          />
          <p className="text-sm text-gray-500">
            当前悬停: {hoveredIndex !== null ? colorfulData[hoveredIndex]?.label : '无'}
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="外部标签 + 引导线"
        description="labelPosition='outside' 时标签在扇区外侧，带引导线显示名称与百分比。"
        code={outsideSnippet}>
        <PieChart
          data={salesData}
          width={440}
          height={320}
          showLabels
          labelPosition="outside"
          hoverable
          shadow
        />
      </DemoBlock>

      <DemoBlock
        title="点击选中 + 图例"
        description="selectable 支持点击选中；配合图例实现完整交互。"
        code={selectableSnippet}>
        <div className="space-y-4">
          <PieChart
            data={colorfulData}
            width={380}
            height={280}
            hoverable
            selectable
            shadow
            showLegend
            legendPosition="right"
            selectedIndex={selectedIndex}
            onSelectedIndexChange={setSelectedIndex}
            onSliceClick={handleSliceClick}
          />
          <p className="text-sm text-gray-500">
            选中: {selectedIndex !== null ? colorfulData[selectedIndex]?.label : '无'}
            {clickedSlice && <span className="ml-4">{clickedSlice}</span>}
          </p>
        </div>
      </DemoBlock>

      <DemoBlock
        title="完整效果"
        description="悬停偏移 + 阴影 + 外部标签 + 图例 + 提示框的完整示例。"
        code={fullSnippet}>
        <PieChart
          data={salesData}
          width={480}
          height={340}
          hoverable
          shadow
          showLabels
          labelPosition="outside"
          showLegend
          legendPosition="right"
          showTooltip
        />
      </DemoBlock>
    </div>
  )
}

export default PieChartDemo

import React, { useState, useMemo } from 'react'
import { DonutChart, type DonutChartDatum } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicData: DonutChartDatum[] = [
  { value: 40, label: '直接访问' },
  { value: 25, label: '邮件营销' },
  { value: 20, label: '联盟广告' },
  { value: 15, label: '搜索引擎' }
]

const interactiveData: DonutChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' },
  { value: 548, label: '搜索引擎' }
]

const basicSnippet = `<DonutChart
  data={data}
  width={360}
  height={260}
  showLabels
  centerValue="100"
  centerLabel="总计"
/>`

const hoverableSnippet = `<DonutChart
  data={data}
  width={360}
  height={260}
  hoverable
  centerValue={hoveredIndex !== null ? data[hoveredIndex]?.value : total}
  centerLabel={hoveredIndex !== null ? data[hoveredIndex]?.label : '访问量'}
  hoveredIndex={hoveredIndex}
  onHoveredIndexChange={setHoveredIndex}
/>`

const selectableSnippet = `<DonutChart
  data={data}
  width={360}
  height={260}
  hoverable
  selectable
  showLabels
  selectedIndex={selectedIndex}
  onSelectedIndexChange={setSelectedIndex}
/>`

const legendSnippet = `<DonutChart
  data={data}
  width={360}
  height={260}
  hoverable
  showLegend
  legendPosition="right"
  centerValue={total}
  centerLabel="访问量"
/>`

const tooltipSnippet = `<DonutChart
  data={data}
  width={360}
  height={260}
  hoverable
  showTooltip
  centerValue={total}
  centerLabel="总计"
/>`

const customSnippet = `<DonutChart
  data={data}
  width={360}
  height={260}
  hoverable
  colors={['#c23531','#2f4554','#61a0a8','#d48265','#91c7ae']}
  innerRadiusRatio={0.5}
  padAngle={0.06}
  hoverOffset={14}
  centerValue="1562"
  centerLabel="总量"
/>`

const DonutChartDemo: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const total = useMemo(() => interactiveData.reduce((s, d) => s + d.value, 0), [])

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">DonutChart 环形图</h1>
        <p className="text-gray-600">
          ECharts 风格的环形图，支持中心内容、阴影、交互高亮等高级特性。
        </p>
      </div>

      <DemoBlock
        title="基础用法"
        description="开箱即用的环形图，默认带阴影和间隙，中心可显示汇总数据。"
        code={basicSnippet}>
        <DonutChart
          data={basicData}
          width={360}
          height={260}
          showLabels
          centerValue="100"
          centerLabel="总计"
        />
      </DemoBlock>

      <DemoBlock
        title="悬停高亮"
        description="启用 hoverable，悬停时扇区外移并放大，配合中心显示实时数据。"
        code={hoverableSnippet}>
        <div className="space-y-4">
          <DonutChart
            data={interactiveData}
            width={360}
            height={260}
            hoverable
            centerValue={hoveredIndex !== null ? interactiveData[hoveredIndex]?.value : total}
            centerLabel={hoveredIndex !== null ? interactiveData[hoveredIndex]?.label : '访问量'}
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
        description="启用 selectable，点击可选中扇区并保持高亮。"
        code={selectableSnippet}>
        <div className="space-y-4">
          <DonutChart
            data={interactiveData}
            width={360}
            height={260}
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
        description="右侧图例 + 中心汇总数据，鼠标与图例联动高亮。"
        code={legendSnippet}>
        <DonutChart
          data={interactiveData}
          width={360}
          height={260}
          hoverable
          showLegend
          legendPosition="right"
          centerValue={total}
          centerLabel="访问量"
        />
      </DemoBlock>

      <DemoBlock
        title="显示提示框"
        description="悬停时显示数据提示框，自动计算百分比。"
        code={tooltipSnippet}>
        <DonutChart
          data={interactiveData}
          width={360}
          height={260}
          hoverable
          showTooltip
          centerValue={total}
          centerLabel="总计"
        />
      </DemoBlock>

      <DemoBlock
        title="自定义样式"
        description="自定义配色、更大的间隙和悬停偏移、不同的内径比。"
        code={customSnippet}>
        <DonutChart
          data={interactiveData}
          width={360}
          height={260}
          hoverable
          colors={['#c23531', '#2f4554', '#61a0a8', '#d48265', '#91c7ae']}
          innerRadiusRatio={0.5}
          padAngle={0.06}
          hoverOffset={14}
          centerValue="1562"
          centerLabel="总量"
        />
      </DemoBlock>
    </div>
  )
}

export default DonutChartDemo

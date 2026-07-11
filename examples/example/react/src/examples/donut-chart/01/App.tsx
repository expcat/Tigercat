import React, { useState, useMemo } from 'react'
import { DonutChart } from '@expcat/tigercat-react/DonutChart'
import { type PieChartDatum } from '@expcat/tigercat-react'

const basicData: PieChartDatum[] = [
  { value: 40, label: '直接访问' },
  { value: 25, label: '邮件营销' },
  { value: 20, label: '联盟广告' },
  { value: 15, label: '搜索引擎' }
]

const interactiveData: PieChartDatum[] = [
  { value: 335, label: '直接访问' },
  { value: 310, label: '邮件营销' },
  { value: 234, label: '联盟广告' },
  { value: 135, label: '视频广告' },
  { value: 548, label: '搜索引擎' }
]

export default function App() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const total = useMemo(() => interactiveData.reduce((s, d) => s + d.value, 0), [])

  const selectedDatum = selectedIndex === null ? undefined : interactiveData[selectedIndex]

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            开箱即用的环形图，默认带阴影和间隙，中心可显示汇总数据。
          </p>
          <DonutChart
            data={basicData}
            width={360}
            height={260}
            showLabels
            centerValue="100"
            centerLabel="总计"
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">悬停高亮</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            启用 hoverable，悬停时扇区外移并放大，配合中心显示实时数据。
          </p>
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
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">点击选中</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            启用 selectable，点击可选中扇区并保持高亮。
          </p>
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
              选中:{' '}
              {selectedDatum
                ? `${selectedDatum.label} · ${selectedDatum.value} · ${((selectedDatum.value / total) * 100).toFixed(1)}%`
                : '无'}
            </p>
          </div>
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">显示图例</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            右侧图例 + 中心汇总数据，鼠标与图例联动高亮。
          </p>
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
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">显示提示框</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            悬停时显示数据提示框，自动计算百分比。
          </p>
          <DonutChart
            data={interactiveData}
            width={360}
            height={260}
            hoverable
            showTooltip
            centerValue={total}
            centerLabel="总计"
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义样式</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            自定义配色、更大的间隙和悬停偏移、不同的内径比。
          </p>
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
        </section>
      </div>
    </>
  )
}

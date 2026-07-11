import React, { useState } from 'react'
import { ScatterChart } from '@expcat/tigercat-react/ScatterChart'
import { type ScatterChartDatum } from '@expcat/tigercat-react'

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

export default function App() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">默认扁平纯色填充，简洁朴素。</p>
          <ScatterChart data={basicData} width={420} height={260} xAxisLabel="X" yAxisLabel="Y" />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义样式</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            通过 datum.size / datum.color 控制每个点的样式。
          </p>
          <ScatterChart
            data={customData}
            width={420}
            height={260}
            includeZero
            gridLineStyle="dotted"
            hoverable
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">入场动画</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            启用 animated 后数据点依次弹入。
          </p>
          <ScatterChart data={interactiveData} width={420} height={260} animated hoverable />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">悬停 + 选中</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            悬停时数据点放大高亮，支持点击选中。
          </p>
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
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">菱形散点</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            通过 pointStyle 切换形状，diamond / square / triangle 均可用。
          </p>
          <ScatterChart
            data={interactiveData}
            width={420}
            height={260}
            pointStyle="diamond"
            pointSize={8}
            hoverable
          />
        </section>
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">渐变风格</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            启用 gradient 与 pointBorderWidth 呈现立体效果。
          </p>
          <ScatterChart
            data={basicData}
            width={420}
            height={260}
            gradient
            pointBorderWidth={1.5}
            hoverable
            showTooltip
          />
        </section>
      </div>
    </>
  )
}

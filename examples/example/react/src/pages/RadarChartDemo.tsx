import React from 'react'
import { RadarChart } from '@expcat/tigercat-react/RadarChart'
import { type RadarChartDatum, type RadarChartSeries } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './RadarChartDemo.tsx?raw'

const basicData: RadarChartDatum[] = [
  { label: '速度', value: 80 },
  { label: '稳定', value: 65 },
  { label: '设计', value: 90 },
  { label: '续航', value: 70 },
  { label: '价格', value: 50 }
]

const customData: RadarChartDatum[] = [
  { label: '攻击', value: 95 },
  { label: '防御', value: 70 },
  { label: '机动', value: 88 },
  { label: '耐久', value: 60 },
  { label: '辅助', value: 75 }
]

const multiSeries: RadarChartSeries[] = [
  {
    name: '产品 A',
    data: [
      { label: '速度', value: 80 },
      { label: '稳定', value: 65 },
      { label: '设计', value: 90 },
      { label: '续航', value: 70 },
      { label: '价格', value: 50 }
    ]
  },
  {
    name: '产品 B',
    data: [
      { label: '速度', value: 72 },
      { label: '稳定', value: 78 },
      { label: '设计', value: 82 },
      { label: '续航', value: 66 },
      { label: '价格', value: 60 }
    ]
  }
]

const tooltipFormatter = (
  datum: RadarChartDatum,
  _seriesIndex: number,
  _index: number,
  series?: RadarChartSeries
) => `${series?.name ?? 'Series'} · ${datum.label ?? ''}: ${datum.value}`

const RadarChartDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">RadarChart 雷达图</h1>
        <p className="text-gray-600 dark:text-gray-400">用于展示多维指标对比。</p>
      </div>

      <DemoBlock
        title="组合展示"
        description="合并展示基础用法、固定最大值、圆形网格 + 分割区域、多系列对比，减少重复示例块。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">默认雷达图样式。</p>
            <RadarChart data={basicData} width={360} height={260} />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">固定最大值</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">统一尺度并增加网格层数。</p>
            <RadarChart
              data={customData}
              width={360}
              height={260}
              maxValue={100}
              levels={6}
              showLevelLabels
              fillOpacity={0.15}
              showPoints
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              圆形网格 + 分割区域
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ECharts 风格的圆形网格与交替背景。
            </p>
            <RadarChart
              data={customData}
              width={360}
              height={260}
              maxValue={100}
              gridShape="circle"
              showSplitArea
              levels={5}
              showLevelLabels
              fillOpacity={0.25}
              strokeWidth={2}
              pointBorderWidth={2}
              pointBorderColor="#fff"
            />
          </section>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">多系列对比</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              多组数据叠加展示，支持交互与分割区域。
            </p>
            <RadarChart
              series={multiSeries}
              width={360}
              height={260}
              maxValue={100}
              colors={['#2563eb', '#f97316']}
              hoverable
              selectable
              showLegend
              legendPosition="right"
              showSplitArea
              fillOpacity={0.15}
              tooltipFormatter={tooltipFormatter}
            />
          </section>
        </div>
      </DemoBlock>
    </div>
  )
}

export default RadarChartDemo

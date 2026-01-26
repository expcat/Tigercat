import React from 'react'
import { PieChart, type PieChartDatum } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicData: PieChartDatum[] = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]

const donutData: PieChartDatum[] = [
  { value: 320, label: 'Q1' },
  { value: 280, label: 'Q2' },
  { value: 360, label: 'Q3' },
  { value: 420, label: 'Q4' }
]

const basicSnippet = `<PieChart
  data={data}
  width={320}
  height={220}
  showLabels
/>`

const donutSnippet = `<PieChart
  data={donutData}
  width={320}
  height={220}
  innerRadius={60}
  padAngle={0.02}
  showLabels
/>`

const PieChartDemo: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PieChart 饼图</h1>
        <p className="text-gray-600">用于展示分类占比。</p>
      </div>

      <DemoBlock title="基础用法" description="默认饼图与标签。" code={basicSnippet}>
        <PieChart data={basicData} width={320} height={220} showLabels />
      </DemoBlock>

      <DemoBlock title="环形图" description="通过内半径渲染环形图。" code={donutSnippet}>
        <PieChart
          data={donutData}
          width={320}
          height={220}
          innerRadius={60}
          padAngle={0.02}
          showLabels
        />
      </DemoBlock>
    </div>
  )
}

export default PieChartDemo

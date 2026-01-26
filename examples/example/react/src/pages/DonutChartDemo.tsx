import React from 'react'
import { DonutChart, type DonutChartDatum } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicData: DonutChartDatum[] = [
  { value: 40, label: 'A' },
  { value: 25, label: 'B' },
  { value: 20, label: 'C' },
  { value: 15, label: 'D' }
]

const donutSnippet = `<DonutChart
  data={data}
  width={320}
  height={220}
  innerRadiusRatio={0.55}
  padAngle={0.02}
  showLabels
/>`

const DonutChartDemo: React.FC = () => {
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
    </div>
  )
}

export default DonutChartDemo

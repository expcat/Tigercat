import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('gauge-chart')

export default function GaugeChartDemo() {
  return (
    <DemoPage
      title="GaugeChart 仪表盘"
      description="环形仪表盘，展示单一指标的进度或状态。"
      modules={modules}
    />
  )
}

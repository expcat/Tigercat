import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('donut-chart')

export default function DonutChartDemo() {
  return (
    <DemoPage
      title="DonutChart 环形图"
      description="ECharts 风格的环形图，支持中心内容、阴影、交互高亮等高级特性。"
      modules={modules}
    />
  )
}

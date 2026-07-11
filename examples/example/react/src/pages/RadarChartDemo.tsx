import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('radar-chart')

export default function RadarChartDemo() {
  return (
    <DemoPage title="RadarChart 雷达图" description="用于展示多维指标对比。" modules={modules} />
  )
}

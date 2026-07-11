import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('sunburst-chart')

export default function SunburstChartDemo() {
  return (
    <DemoPage
      title="SunburstChart 旭日图"
      description="以多层同心弧展示层级数据结构。"
      modules={modules}
    />
  )
}

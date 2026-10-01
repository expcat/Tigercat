import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('waterfall-chart')

export default function WaterfallChartDemo() {
  return (
    <DemoPage
      title="WaterfallChart 瀑布图"
      description="展示增减变化及合计值。"
      modules={modules}
    />
  )
}

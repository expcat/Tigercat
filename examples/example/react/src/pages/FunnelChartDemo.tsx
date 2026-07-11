import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('funnel-chart')

export default function FunnelChartDemo() {
  return (
    <DemoPage
      title="FunnelChart 漏斗图"
      description="展示数据从大到小递减的流程或转化率。"
      modules={modules}
    />
  )
}

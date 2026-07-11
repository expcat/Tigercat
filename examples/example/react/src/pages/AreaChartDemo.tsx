import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('area-chart')

export default function AreaChartDemo() {
  return (
    <DemoPage
      title="AreaChart 面积图"
      description="用于展示数据随时间变化的趋势，强调数量累积。"
      modules={modules}
    />
  )
}

import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('line-chart')

export default function LineChartDemo() {
  return (
    <DemoPage
      title="LineChart 折线图"
      description="用于展示数据随时间或类别变化趋势。"
      modules={modules}
    />
  )
}

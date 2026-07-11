import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('scatter-chart')

export default function ScatterChartDemo() {
  return (
    <DemoPage
      title="ScatterChart 散点图"
      description="用于展示二维数值分布，默认扁平风格，可选渐变填充与入场动画。"
      modules={modules}
    />
  )
}

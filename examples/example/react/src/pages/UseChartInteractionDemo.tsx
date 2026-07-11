import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('use-chart-interaction')

export default function UseChartInteractionDemo() {
  return (
    <DemoPage
      title="useChartInteraction 图表交互"
      description="统一管理图表的悬停高亮、选中态、键盘可达性与图例联动，被内置的 BarChart / LineChart\n          等组件使用。"
      modules={modules}
    />
  )
}

import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('treemap-chart')

export default function TreeMapChartDemo() {
  return (
    <DemoPage
      title="TreeMapChart 矩形树图"
      description="以嵌套矩形展示层级数据的占比关系。"
      modules={modules}
    />
  )
}

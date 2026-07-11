import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('heatmap-chart')

export default function HeatmapChartDemo() {
  return (
    <DemoPage
      title="HeatmapChart 热力图"
      description="矩阵热力图，用颜色深浅展示数据密度。"
      modules={modules}
    />
  )
}

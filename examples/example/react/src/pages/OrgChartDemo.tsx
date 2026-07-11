import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('org-chart')

export default function OrgChartDemo() {
  return (
    <DemoPage
      title="OrgChart 组织结构图"
      description="基于 Tree 数据结构生成 SVG 组织结构图，支持选中、悬停和方向切换。"
      modules={modules}
    />
  )
}

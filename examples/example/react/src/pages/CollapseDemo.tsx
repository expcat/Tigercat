import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('collapse')

export default function CollapseDemo() {
  return (
    <DemoPage
      title="Collapse 折叠面板"
      description="可以折叠/展开的内容区域，用于将复杂的区域折叠起来。"
      modules={modules}
    />
  )
}

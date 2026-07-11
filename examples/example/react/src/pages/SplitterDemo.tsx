import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('splitter')

export default function SplitterDemo() {
  return (
    <DemoPage
      title="Splitter 分割面板"
      description="可拖拽分割面板，支持水平/垂直、嵌套和最小尺寸。"
      modules={modules}
    />
  )
}

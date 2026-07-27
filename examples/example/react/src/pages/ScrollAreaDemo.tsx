import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('scroll-area')

export default function ScrollAreaDemo() {
  return (
    <DemoPage
      title="ScrollArea 滚动区域"
      description="样式化滚动条容器，支持横纵向滚动、滚动阴影与命令式 scrollTo。"
      modules={modules}
    />
  )
}

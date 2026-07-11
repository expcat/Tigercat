import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('card')

export default function CardDemo() {
  return (
    <DemoPage
      title="Card 卡片"
      description="用于内容展示的卡片容器组件，支持多种样式和布局选项。"
      modules={modules}
    />
  )
}

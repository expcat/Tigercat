import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('float-button')

export default function FloatButtonDemo() {
  return (
    <DemoPage
      title="FloatButton 悬浮按钮"
      description="悬浮在页面角落的操作按钮，支持分组展开。"
      modules={modules}
    />
  )
}

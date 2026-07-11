import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('modal')

export default function ModalDemo() {
  return (
    <DemoPage
      title="Modal 对话框"
      description="用于显示重要信息或需要用户交互的浮层对话框。"
      modules={modules}
    />
  )
}

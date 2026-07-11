import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('chat-window')

export default function ChatWindowDemo() {
  return (
    <DemoPage
      title="ChatWindow 聊天窗口"
      description="组合组件，用于构建完整聊天交互区域。"
      modules={modules}
    />
  )
}

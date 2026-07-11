import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('tooltip')

export default function TooltipDemo() {
  return (
    <DemoPage
      title="Tooltip 气泡提示"
      description="用于显示简洁的文本提示信息。"
      modules={modules}
    />
  )
}

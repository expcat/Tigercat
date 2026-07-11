import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('popover')

export default function PopoverDemo() {
  return (
    <DemoPage title="Popover 气泡卡片" description="用于显示复杂的自定义内容。" modules={modules} />
  )
}

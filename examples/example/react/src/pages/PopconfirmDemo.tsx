import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('popconfirm')

export default function PopconfirmDemo() {
  return (
    <DemoPage
      title="Popconfirm 弹出确认"
      description="用于在执行敏感操作时向用户确认。"
      modules={modules}
    />
  )
}

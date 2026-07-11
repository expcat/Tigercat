import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('notification-center')

export default function NotificationCenterDemo() {
  return (
    <DemoPage
      title="NotificationCenter 通知中心"
      description="组合组件，提供通知分组、已读筛选与批量标记。"
      modules={modules}
    />
  )
}

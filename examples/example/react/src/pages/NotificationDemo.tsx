import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('notification')

export default function NotificationDemo() {
  return (
    <DemoPage
      title="Notification 通知"
      description="全局显示通知提示信息，支持多种展示位置、关闭与定时消失。"
      modules={modules}
    />
  )
}

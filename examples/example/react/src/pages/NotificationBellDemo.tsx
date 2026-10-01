import DemoPage from '../components/DemoPage'
import { getDemoModules } from '../playground/registry'

const modules = getDemoModules('notification-bell')

export default function NotificationBellDemo() {
  return (
    <DemoPage
      title="NotificationBell 通知铃铛"
      description="显示未读数量并打开通知中心。"
      modules={modules}
    />
  )
}

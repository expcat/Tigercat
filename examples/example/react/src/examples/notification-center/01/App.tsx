import { NotificationCenter } from '@expcat/tigercat-react/NotificationCenter'
import type { NotificationItem } from '@expcat/tigercat-core'

const items: NotificationItem[] = [
  {
    id: 1,
    title: '系统维护提醒',
    description: '今晚 23:00 开始例行维护。',
    time: '10:30',
    type: '系统',
    read: false
  },
  {
    id: 2,
    title: '评论有新回复',
    description: '示例精简方案已确认。',
    time: '09:12',
    type: '评论',
    read: true
  }
]

export default function App() {
  return (
    <div className="max-w-lg">
      <NotificationCenter items={items} groupOrder={['系统', '评论']} manageReadState />
    </div>
  )
}

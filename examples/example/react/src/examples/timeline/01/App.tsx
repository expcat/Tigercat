import { Timeline } from '@expcat/tigercat-react/Timeline'

const items = [
  { key: 1, label: '09:00', content: '创建项目', color: '#10b981' },
  { key: 2, label: '11:30', content: '完成设计评审', color: '#3b82f6' },
  { key: 3, label: '16:00', content: '发布首个版本', color: '#8b5cf6' }
]

export default function App() {
  return <Timeline items={items} mode="alternate" />
}

import { Timeline } from '@expcat/tigercat-react/Timeline'

const items = [
  { key: 1, label: '第一步', content: '提交申请' },
  { key: 2, label: '第二步', content: '人工审核' }
]

export default function App() {
  return (
    <Timeline
      items={items}
      reverse
      pending
      pendingContent={<span className="text-blue-600">处理中…</span>}
    />
  )
}

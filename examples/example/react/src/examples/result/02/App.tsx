import { Result } from '@expcat/tigercat-react/Result'

const statuses = ['info', 'warning', 'error', '404', '403', '500'] as const

export default function App() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {statuses.map((status) => (
        <div key={status} className="rounded border border-gray-200 dark:border-gray-700">
          <Result status={status} title={`状态：${status}`} subTitle="状态决定图标与配色" />
        </div>
      ))}
    </div>
  )
}

import { Result } from '@expcat/tigercat-react/Result'

const semantic = ['success', 'info', 'warning', 'error'] as const
const http = ['404', '403', '500'] as const

export default function App() {
  return (
    <div className="grid min-h-full grid-cols-1 gap-4 overflow-auto sm:grid-cols-3">
      {semantic.map((status) => (
        <div key={status} className="rounded border border-gray-200 dark:border-gray-700">
          <Result status={status} title={status} subTitle="语义状态" />
        </div>
      ))}
      {http.map((status) => (
        <div key={status} className="rounded border border-gray-200 dark:border-gray-700">
          <Result status={status} subTitle="HTTP 数字即可见名" />
        </div>
      ))}
    </div>
  )
}

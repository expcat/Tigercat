import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Loading } from '@expcat/tigercat-react/Loading'

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="relative min-h-40 rounded-lg border border-gray-200 p-5">
      <p>本月活跃用户：1,234</p>
      <Button className="mt-4" size="sm" onClick={() => setLoading((value) => !value)}>
        {loading ? '显示内容' : '重新加载'}
      </Button>
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/85 dark:bg-gray-950/85">
          <Loading variant="ring" text="刷新中…" />
        </div>
      ) : null}
    </div>
  )
}

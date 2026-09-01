import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Loading } from '@expcat/tigercat-react/Loading'

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="space-y-3">
      <Loading spinning={loading} variant="ring">
        <div className="min-h-40 rounded-lg border border-gray-200 p-5">
          <p>本月活跃用户：1,234</p>
        </div>
      </Loading>
      <Button size="sm" onClick={() => setLoading((value) => !value)}>
        {loading ? '显示内容' : '重新加载'}
      </Button>
    </div>
  )
}

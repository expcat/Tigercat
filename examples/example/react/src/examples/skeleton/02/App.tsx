import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Skeleton } from '@expcat/tigercat-react/Skeleton'

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="space-y-4">
      <Button size="sm" onClick={() => setLoading((value) => !value)}>
        切换加载状态
      </Button>
      {loading ? <Skeleton variant="text" rows={2} paragraph /> : <p>内容加载完成。</p>}
    </div>
  )
}

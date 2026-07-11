import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { List } from '@expcat/tigercat-react/List'

export default function App() {
  const [loading, setLoading] = useState(true)

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={() => setLoading((value) => !value)}>
        切换加载/空态
      </Button>
      <List dataSource={[]} loading={loading} emptyText="暂无数据" />
    </div>
  )
}

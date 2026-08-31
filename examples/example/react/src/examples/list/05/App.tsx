import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { List } from '@expcat/tigercat-react/List'

const items = [
  { key: 1, title: '已有数据 1' },
  { key: 2, title: '已有数据 2' }
]

export default function App() {
  const [loading, setLoading] = useState(true)
  const [empty, setEmpty] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setLoading((value) => !value)}>
          切换加载
        </Button>
        <Button size="sm" onClick={() => setEmpty((value) => !value)}>
          切换空态
        </Button>
      </div>
      <List dataSource={empty ? [] : items} loading={loading} emptyText="暂无数据" />
    </div>
  )
}

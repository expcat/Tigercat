import { useState } from 'react'
import { List } from '@expcat/tigercat-react/List'
import { Pagination } from '@expcat/tigercat-react/Pagination'

const items = Array.from({ length: 12 }, (_, index) => ({
  key: index + 1,
  title: `列表项 ${index + 1}`,
  description: '分页数据'
}))

export default function App() {
  const [page, setPage] = useState(1)
  const pageSize = 4
  const visible = items.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-3">
      <List dataSource={visible} />
      <Pagination current={page} pageSize={pageSize} total={items.length} onChange={setPage} />
    </div>
  )
}

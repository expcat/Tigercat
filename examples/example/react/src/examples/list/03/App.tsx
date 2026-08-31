import { useState } from 'react'
import { List } from '@expcat/tigercat-react/List'

const items = Array.from({ length: 12 }, (_, index) => ({
  key: index + 1,
  title: `列表项 ${index + 1}`,
  description: '分页数据'
}))

export default function App() {
  const [page, setPage] = useState(1)

  return (
    <List
      dataSource={items}
      pagination={{ current: page, pageSize: 4 }}
      onPageChange={({ current }) => setPage(current)}
    />
  )
}

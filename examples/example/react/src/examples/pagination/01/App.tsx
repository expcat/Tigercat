import { useState } from 'react'
import { Pagination } from '@expcat/tigercat-react/Pagination'

export default function App() {
  const [current, setCurrent] = useState(3)
  const [pageSize, setPageSize] = useState(20)

  return (
    <Pagination
      current={current}
      pageSize={pageSize}
      total={240}
      pageSizeOptions={[10, 20, 50]}
      showQuickJumper
      showSizeChanger
      showTotal
      onChange={(page, size) => {
        setCurrent(page)
        setPageSize(size)
      }}
    />
  )
}

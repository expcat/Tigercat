import { useState } from 'react'
import { Pagination } from '@expcat/tigercat-react/Pagination'

export default function App() {
  const [current, setCurrent] = useState(1)

  return (
    <Pagination
      current={current}
      total={96}
      labels={{
        totalText: '共 {total} 条记录',
        itemsPerPageText: '条/页',
        jumpToText: '跳至',
        pageText: '页',
        prevPageAriaLabel: '上一页',
        nextPageAriaLabel: '下一页'
      }}
      showQuickJumper
      onChange={setCurrent}
    />
  )
}

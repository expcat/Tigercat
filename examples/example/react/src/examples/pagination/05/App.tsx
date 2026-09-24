import { useState } from 'react'
import { Pagination } from '@expcat/tigercat-react/Pagination'

export default function App() {
  const [page, setPage] = useState(1)
  return <Pagination current={page} total={200} ellipsisJump onChange={setPage} />
}

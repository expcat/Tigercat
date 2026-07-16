import { useState } from 'react'
import { Pagination } from '@expcat/tigercat-react/Pagination'

export default function App() {
  const [current, setCurrent] = useState(2)

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-sm text-gray-500">simple（仅前后翻页）</p>
        <Pagination current={current} total={120} simple align="left" onChange={setCurrent} />
      </div>
      <div>
        <p className="mb-1 text-sm text-gray-500">disabled</p>
        <Pagination current={3} total={120} align="left" disabled />
      </div>
    </div>
  )
}

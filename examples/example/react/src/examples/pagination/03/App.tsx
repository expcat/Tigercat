import { useState } from 'react'
import { Pagination } from '@expcat/tigercat-react/Pagination'

const rows = [
  { size: 'small', align: 'start' },
  { size: 'medium', align: 'center' },
  { size: 'large', align: 'end' }
] as const

export default function App() {
  const [current, setCurrent] = useState(2)

  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.size}>
          <p className="mb-1 text-sm text-gray-500">
            size={row.size} · align={row.align}
          </p>
          <Pagination
            current={current}
            total={120}
            size={row.size}
            align={row.align}
            onChange={setCurrent}
          />
        </div>
      ))}
    </div>
  )
}

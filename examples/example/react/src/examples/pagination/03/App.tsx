import { useState } from 'react'
import { Pagination } from '@expcat/tigercat-react/Pagination'

const sizes = ['small', 'medium', 'large'] as const

export default function App() {
  const [current, setCurrent] = useState(2)

  return (
    <div className="space-y-4">
      {sizes.map((size) => (
        <div key={size}>
          <p className="mb-1 text-sm text-gray-500">size={size}</p>
          <Pagination
            current={current}
            total={120}
            size={size}
            align="left"
            onChange={setCurrent}
          />
        </div>
      ))}
    </div>
  )
}

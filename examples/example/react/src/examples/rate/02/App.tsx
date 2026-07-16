import { useState } from 'react'
import { Rate } from '@expcat/tigercat-react/Rate'

const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [value, setValue] = useState(3)

  return (
    <div className="space-y-3">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-10 text-sm text-gray-500">{size}</span>
          <Rate value={value} onChange={setValue} size={size} />
        </div>
      ))}
      <div className="flex items-center gap-3">
        <span className="w-10 text-sm text-gray-500">count</span>
        <Rate value={value} onChange={setValue} count={10} />
      </div>
    </div>
  )
}

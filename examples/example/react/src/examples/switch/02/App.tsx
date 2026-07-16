import { useState } from 'react'
import { Switch } from '@expcat/tigercat-react/Switch'

const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [on, setOn] = useState(true)

  return (
    <div className="flex items-center gap-6">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-2">
          <Switch checked={on} onChange={setOn} size={size} aria-label={`尺寸 ${size}`} />
          <span className="text-sm text-gray-500">{size}</span>
        </div>
      ))}
    </div>
  )
}

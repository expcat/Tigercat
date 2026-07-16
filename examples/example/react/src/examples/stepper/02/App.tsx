import { useState } from 'react'
import { Stepper } from '@expcat/tigercat-react/Stepper'

const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [value, setValue] = useState(3)

  return (
    <div className="space-y-3">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-8 text-sm text-gray-500">{size}</span>
          <Stepper value={value} onChange={setValue} size={size} />
        </div>
      ))}
    </div>
  )
}

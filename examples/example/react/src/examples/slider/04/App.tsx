import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react/Slider'

const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [value, setValue] = useState<number | [number, number]>(60)

  return (
    <div className="w-full max-w-lg space-y-6">
      {sizes.map((size) => (
        <div key={size}>
          <p className="mb-1 text-sm text-gray-500">size={size}</p>
          <Slider value={value} onChange={setValue} size={size} />
        </div>
      ))}
      <div>
        <p className="mb-1 text-sm text-gray-500">disabled + tooltip=false</p>
        <Slider value={40} disabled tooltip={false} />
      </div>
    </div>
  )
}

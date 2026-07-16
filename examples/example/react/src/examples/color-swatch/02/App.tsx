import { useState } from 'react'
import { ColorSwatch } from '@expcat/tigercat-react/ColorSwatch'

const palette = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']
const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [color, setColor] = useState('#3b82f6')

  return (
    <div className="space-y-4">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="w-8 text-sm text-gray-500">{size}</span>
          <ColorSwatch
            value={color}
            onChange={setColor}
            colors={palette}
            size={size}
            ariaLabel={`尺寸 ${size}`}
          />
        </div>
      ))}
      <p className="text-sm text-gray-500">当前：{color}</p>
    </div>
  )
}

import { useState } from 'react'
import { ColorPicker } from '@expcat/tigercat-react/ColorPicker'

const formats = ['hex', 'rgb', 'hsl'] as const
const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [color, setColor] = useState('#2563eb')

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {formats.map((format) => (
          <div key={format} className="flex items-center gap-2">
            <ColorPicker value={color} onChange={setColor} format={format} />
            <span className="text-sm text-gray-500">{format}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {sizes.map((size) => (
          <ColorPicker key={size} value={color} onChange={setColor} size={size} />
        ))}
      </div>
    </div>
  )
}

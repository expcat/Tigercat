import { useState } from 'react'
import { ColorSwatch } from '@expcat/tigercat-react/ColorSwatch'

const palette = [
  '#0ea5e9',
  '#22c55e',
  '#eab308',
  '#f97316',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#64748b'
]

export default function App() {
  const [color, setColor] = useState('#22c55e')

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm text-gray-500">columns=4</p>
        <ColorSwatch
          value={color}
          onChange={setColor}
          colors={palette}
          columns={4}
          ariaLabel="四列色板"
        />
      </div>
      <div>
        <p className="mb-2 text-sm text-gray-500">disabled</p>
        <ColorSwatch value={color} colors={palette} columns={8} disabled ariaLabel="禁用色板" />
      </div>
    </div>
  )
}

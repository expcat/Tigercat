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
    <div className="space-y-4" dir="rtl">
      <ColorSwatch value={color} onChange={setColor} colors={palette} columns={4} />
    </div>
  )
}

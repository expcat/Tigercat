import { useState } from 'react'
import { ColorPicker } from '@expcat/tigercat-react/ColorPicker'

export default function App() {
  const [color, setColor] = useState('#059669')

  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex items-center gap-2">
        <ColorPicker
          value={color}
          onChange={setColor}
          presets={['#059669', '#2563eb', '#7c3aed', '#dc2626', '#f59e0b', '#0891b2']}
        />
        <span className="text-sm text-gray-500">presets 快速选色</span>
      </div>
      <div className="flex items-center gap-2">
        <ColorPicker value="#94a3b8" disabled />
        <span className="text-sm text-gray-500">disabled</span>
      </div>
    </div>
  )
}

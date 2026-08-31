import { useState } from 'react'
import { ColorPicker } from '@expcat/tigercat-react/ColorPicker'

const formats = ['hex', 'rgb', 'hsl'] as const
const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [hex, setHex] = useState('#2563eb')
  const [rgb, setRgb] = useState('rgb(37, 99, 235)')
  const [hsl, setHsl] = useState('hsl(221, 83%, 53%)')
  const [sizeColor, setSizeColor] = useState('#2563eb')

  const values = { hex, rgb, hsl }
  const setters = { hex: setHex, rgb: setRgb, hsl: setHsl }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {formats.map((format) => (
          <div key={format} className="flex items-center gap-2">
            <ColorPicker value={values[format]} onChange={setters[format]} format={format} />
            <span className="text-sm text-gray-500">{format}</span>
            <code className="text-xs text-[var(--tiger-text-muted,#6b7280)]">{values[format]}</code>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {sizes.map((size) => (
          <ColorPicker key={size} value={sizeColor} onChange={setSizeColor} size={size} />
        ))}
      </div>
    </div>
  )
}

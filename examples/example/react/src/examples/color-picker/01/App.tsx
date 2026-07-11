import { useState } from 'react'
import { ColorPicker } from '@expcat/tigercat-react/ColorPicker'

export default function App() {
  const [color, setColor] = useState('rgba(37, 99, 235, 0.8)')

  return (
    <ColorPicker
      value={color}
      onChange={setColor}
      showAlpha
      format="rgb"
      presets={['#2563eb', '#0891b2', '#059669', '#dc2626']}
      size="lg"
    />
  )
}

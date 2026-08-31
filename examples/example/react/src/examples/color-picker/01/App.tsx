import { useState } from 'react'
import { ColorPicker } from '@expcat/tigercat-react/ColorPicker'
import { FormItem } from '@expcat/tigercat-react/FormItem'

export default function App() {
  const [color, setColor] = useState('rgba(37, 99, 235, 0.8)')

  return (
    <FormItem label="主题色">
      <div className="flex flex-wrap items-center gap-3">
        <ColorPicker
          value={color}
          onChange={setColor}
          showAlpha
          format="rgb"
          presets={['#2563eb', '#0891b2', '#059669', '#dc2626']}
          size="lg"
        />
        <code className="text-sm text-[var(--tiger-text-muted,#6b7280)]">{color}</code>
      </div>
    </FormItem>
  )
}

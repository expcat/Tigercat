import { useState } from 'react'
import { Slider } from '@expcat/tigercat-react/Slider'
import { FormItem } from '@expcat/tigercat-react/FormItem'

const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [value, setValue] = useState<number | [number, number]>(60)

  return (
    <div className="w-full max-w-lg space-y-6">
      {sizes.map((size) => (
        <FormItem key={size} label={`size=${size}`}>
          <Slider value={value} onChange={setValue} size={size} />
        </FormItem>
      ))}
      <FormItem label="disabled">
        <Slider value={40} disabled tooltip={false} />
      </FormItem>
    </div>
  )
}

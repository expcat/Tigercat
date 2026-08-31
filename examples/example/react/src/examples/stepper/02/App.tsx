import { useState } from 'react'
import { Stepper } from '@expcat/tigercat-react/Stepper'
import { FormItem } from '@expcat/tigercat-react/FormItem'

const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  const [value, setValue] = useState(3)

  return (
    <div className="space-y-3">
      {sizes.map((size) => (
        <FormItem key={size} label={size}>
          <Stepper value={value} onChange={setValue} size={size} />
        </FormItem>
      ))}
    </div>
  )
}

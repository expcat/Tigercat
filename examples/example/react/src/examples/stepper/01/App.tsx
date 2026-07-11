import { useState } from 'react'
import { Stepper } from '@expcat/tigercat-react/Stepper'

export default function App() {
  const [value, setValue] = useState(2.5)

  return (
    <Stepper
      value={value}
      onChange={setValue}
      min={0}
      max={10}
      step={0.5}
      precision={1}
      size="lg"
      incrementAriaLabel="增加数值"
      decrementAriaLabel="减少数值"
    />
  )
}

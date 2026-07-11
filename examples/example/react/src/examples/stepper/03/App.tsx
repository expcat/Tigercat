import { Space } from '@expcat/tigercat-react/Space'
import { Text } from '@expcat/tigercat-react/Text'
import { useState } from 'react'
import { Stepper } from '@expcat/tigercat-react/Stepper'

const stepperA11y = {
  incrementAriaLabel: '增加数值',
  decrementAriaLabel: '减少数值'
}

export default function App() {
  const [val, setVal] = useState(3)

  return (
    <>
      <Stepper value={1.5} step={0.1} precision={2} min={0} max={5} {...stepperA11y} />
    </>
  )
}

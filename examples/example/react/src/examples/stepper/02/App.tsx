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
      <Space direction="vertical" size={12}>
        <Stepper value={1} size="sm" {...stepperA11y} />
        <Stepper value={1} size="md" {...stepperA11y} />
        <Stepper value={1} size="lg" {...stepperA11y} />
        <Stepper value={1} disabled {...stepperA11y} />
      </Space>
    </>
  )
}

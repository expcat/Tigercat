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
        <Stepper value={val} onChange={setVal} {...stepperA11y} />
        <Stepper value={val} onChange={setVal} min={0} max={10} step={2} {...stepperA11y} />
        <Text>当前值: {val}</Text>
      </Space>
    </>
  )
}

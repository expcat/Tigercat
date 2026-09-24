import { useState } from 'react'
import { Steps, StepsItem } from '@expcat/tigercat-react/Steps'

export default function App() {
  const [current, setCurrent] = useState(1)
  return (
    <Steps progressDot clickable current={current} status="error" onChange={setCurrent}>
      <StepsItem title="起草" />
      <StepsItem title="校验" />
      <StepsItem title="发布" />
    </Steps>
  )
}

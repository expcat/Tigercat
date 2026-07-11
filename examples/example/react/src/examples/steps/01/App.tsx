import { useState } from 'react'
import { Steps } from '@expcat/tigercat-react/Steps'
import { StepsItem } from '@expcat/tigercat-react/StepsItem'

export default function App() {
  const [current, setCurrent] = useState(1)

  return (
    <Steps current={current} clickable size="small" onChange={setCurrent}>
      <StepsItem title="填写资料" description="完善账户信息" />
      <StepsItem title="身份验证" description="确认联系方式" />
      <StepsItem title="完成" description="开始使用" />
    </Steps>
  )
}

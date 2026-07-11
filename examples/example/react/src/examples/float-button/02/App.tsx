import { useState } from 'react'
import { FloatButton } from '@expcat/tigercat-react/FloatButton'
import { FloatButtonGroup } from '@expcat/tigercat-react/FloatButtonGroup'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未点击悬浮按钮')

  return (
    <>
      <FloatButton
        floating
        placement="bottom-right"
        offset={24}
        tooltip="客服"
        ariaLabel="客服入口"
        onClick={() => setLastAction('已打开客服入口')}
      />
    </>
  )
}

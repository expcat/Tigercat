import { Countdown } from '@expcat/tigercat-react/Countdown'
import { Space } from '@expcat/tigercat-react/Space'
import { useMemo, useState } from 'react'
import { Card } from '@expcat/tigercat-react/Card'

export default function App() {
  const now = useMemo(() => Date.now(), [])

  const [status, setStatus] = useState('等待付款')

  return (
    <>
      <Space size={32}>
        <Countdown
          title="跨天任务"
          value={now + 26 * 60 * 60 * 1000}
          now={now}
          format="D 天 HH:mm:ss"
        />
        <Countdown
          title="紧急窗口"
          value={now + 90 * 1000}
          now={now}
          prefix="T-"
          suffix=" remaining"
        />
      </Space>
    </>
  )
}

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
        <Countdown title="活动结束" value={now + 2 * 60 * 60 * 1000} now={now} />
        <Countdown title="发售倒计时" value={now + 15 * 60 * 1000} now={now} format="mm:ss" />
      </Space>
    </>
  )
}

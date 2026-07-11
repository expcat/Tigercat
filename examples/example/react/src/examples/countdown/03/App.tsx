import { Countdown } from '@expcat/tigercat-react/Countdown'
import { Space } from '@expcat/tigercat-react/Space'
import { useMemo, useState } from 'react'
import { Card } from '@expcat/tigercat-react/Card'

export default function App() {
  const now = useMemo(() => Date.now(), [])

  const [status, setStatus] = useState('等待付款')

  return (
    <>
      <Card style={{ width: 260 }}>
        <Countdown
          title="付款保留时间"
          value={now + 10 * 1000}
          now={now}
          onFinish={() => setStatus('订单已释放')}
        />
        <div className="mt-3 text-sm text-gray-500">{status}</div>
      </Card>
    </>
  )
}

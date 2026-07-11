import { useMemo, useState } from 'react'
import { Countdown } from '@expcat/tigercat-react/Countdown'

export default function App() {
  const now = useMemo(() => Date.now(), [])
  const [status, setStatus] = useState('等待付款')

  return (
    <div>
      <Countdown
        title="付款保留时间"
        value={now + 10 * 1000}
        now={now}
        onFinish={() => setStatus('订单已释放')}
      />
      <p className="mt-2 text-sm text-gray-500">{status}</p>
    </div>
  )
}

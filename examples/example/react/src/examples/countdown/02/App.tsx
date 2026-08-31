import { useState } from 'react'
import { Countdown } from '@expcat/tigercat-react/Countdown'

export default function App() {
  const [status, setStatus] = useState('等待付款')

  return (
    <div className="space-y-4">
      <div>
        <Countdown
          title="付款保留时间"
          value={Date.now() + 10 * 1000}
          onFinish={() => setStatus('订单已释放')}
        />
        <p className="mt-2 text-sm text-gray-500">{status}</p>
      </div>
      <Countdown title="已到期" value={Date.now() - 1000} />
    </div>
  )
}

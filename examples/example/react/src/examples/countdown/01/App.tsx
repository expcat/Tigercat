import { useMemo } from 'react'
import { Countdown } from '@expcat/tigercat-react/Countdown'

export default function App() {
  const now = useMemo(() => Date.now(), [])

  return (
    <Countdown
      title="活动结束"
      value={now + 26 * 60 * 60 * 1000}
      now={now}
      format="D 天 HH:mm:ss"
      prefix="剩余 "
      size="lg"
    />
  )
}

import { Countdown } from '@expcat/tigercat-react/Countdown'

export default function App() {
  return (
    <Countdown
      title="活动结束"
      value={Date.now() + 26 * 60 * 60 * 1000}
      format="D HH:mm:ss"
      prefix="剩余 "
      size="lg"
    />
  )
}

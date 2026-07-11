import { useState } from 'react'
import { TimePicker } from '@expcat/tigercat-react/TimePicker'

export default function App() {
  const [range, setRange] = useState<[string | null, string | null]>(['09:00', '18:00'])

  return (
    <TimePicker
      range
      value={range}
      onChange={setRange}
      minuteStep={15}
      className="w-full max-w-[360px]"
    />
  )
}

import { useState } from 'react'
import { TimePicker } from '@expcat/tigercat-react/TimePicker'

export default function App() {
  const [value, setValue] = useState<string | null>('09:30:00')

  return (
    <TimePicker
      value={value}
      onChange={setValue}
      showSeconds
      minuteStep={5}
      size="lg"
      clearable
      className="w-full max-w-[280px]"
    />
  )
}

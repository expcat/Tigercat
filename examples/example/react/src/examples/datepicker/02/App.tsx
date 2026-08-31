import { useState } from 'react'
import { DatePicker } from '@expcat/tigercat-react/DatePicker'

export default function App() {
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null])

  return (
    <DatePicker
      range
      defaultOpen
      value={range}
      onChange={setRange}
      className="w-full max-w-[360px]"
    />
  )
}

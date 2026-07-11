import { useState } from 'react'
import { DatePicker } from '@expcat/tigercat-react/DatePicker'

export default function App() {
  const [range, setRange] = useState<[Date | null, Date | null]>([null, null])

  return (
    <DatePicker
      range
      value={range}
      onChange={setRange}
      placeholder="选择开始和结束日期"
      className="w-full max-w-[360px]"
    />
  )
}

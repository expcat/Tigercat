import { useState } from 'react'
import { DatePicker } from '@expcat/tigercat-react/DatePicker'

export default function App() {
  const [value, setValue] = useState<Date | null>(null)

  return (
    <DatePicker
      value={value}
      onChange={setValue}
      minDate="2026-01-01"
      maxDate="2026-12-31"
      placeholder="仅可选择 2026 年日期"
      className="w-full max-w-[280px]"
    />
  )
}

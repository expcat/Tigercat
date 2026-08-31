import { useState } from 'react'
import { DatePicker } from '@expcat/tigercat-react/DatePicker'

const weekday = new Date(2026, 5, 15)
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

export default function App() {
  const [value, setValue] = useState<Date | null>(weekday)

  return (
    <DatePicker
      value={value}
      onChange={setValue}
      minDate="2026-01-01"
      maxDate="2026-12-31"
      disabledDate={isWeekend}
      className="w-full max-w-[280px]"
    />
  )
}

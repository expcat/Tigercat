import { useState } from 'react'
import { Calendar } from '@expcat/tigercat-react/Calendar'

const weekday = new Date(2024, 5, 14)
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

export default function App() {
  const [date, setDate] = useState<Date | undefined>(weekday)

  return (
    <Calendar value={date} now={weekday} fullscreen disabledDate={isWeekend} onChange={setDate} />
  )
}

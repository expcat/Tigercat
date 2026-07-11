import { useState } from 'react'
import { Calendar } from '@expcat/tigercat-react/Calendar'

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

export default function App() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Calendar value={date} mode="year" fullscreen disabledDate={isWeekend} onChange={setDate} />
  )
}

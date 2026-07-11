import { useCallback, useState } from 'react'
import { Calendar } from '@expcat/tigercat-react/Calendar'

export default function App() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const [date2, setDate2] = useState<Date | undefined>(new Date())

  const isWeekend = useCallback((d: Date) => {
    const day = d.getDay()
    return day === 0 || day === 6
  }, [])

  return (
    <>
      <Calendar value={date2} onChange={setDate2} disabledDate={isWeekend} />
    </>
  )
}

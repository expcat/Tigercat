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
      <Calendar value={date} onChange={setDate} />
      <p className="mt-2 text-sm text-gray-500">选中日期: {date?.toLocaleDateString() ?? '无'}</p>
    </>
  )
}

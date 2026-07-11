import { useState } from 'react'
import { Calendar } from '@expcat/tigercat-react/Calendar'

export default function App() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <div>
      <Calendar value={date} onChange={setDate} />
      <p className="mt-2 text-sm text-gray-500">选中日期：{date?.toLocaleDateString() ?? '无'}</p>
    </div>
  )
}

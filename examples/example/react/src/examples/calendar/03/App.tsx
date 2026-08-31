import { useState } from 'react'
import { Calendar } from '@expcat/tigercat-react/Calendar'
import type { CalendarMode } from '@expcat/tigercat-core'

const june = new Date(2024, 5, 15)

export default function App() {
  const [date, setDate] = useState<Date | undefined>(june)
  const [mode, setMode] = useState<CalendarMode>('year')

  return (
    <Calendar
      value={date}
      now={june}
      mode={mode}
      onChange={setDate}
      onPanelChange={(_next, nextMode) => setMode(nextMode)}
    />
  )
}

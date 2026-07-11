import { useState } from 'react'
import { DatePicker } from '@expcat/tigercat-react/DatePicker'

export default function App() {
  const [value, setValue] = useState<Date | null>(null)

  return (
    <DatePicker
      value={value}
      onChange={setValue}
      size="lg"
      clearable
      placeholder="请选择日期"
      className="w-full max-w-[280px]"
    />
  )
}

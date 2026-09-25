import { useState } from 'react'
import { DatePicker } from '@expcat/tigercat-react/DatePicker'
import { FormItem } from '@expcat/tigercat-react/FormItem'

export default function App() {
  const [value, setValue] = useState<Date | null>(null)

  return (
    <FormItem label="日期" className="w-full max-w-[280px]">
      <DatePicker value={value} onChange={setValue} />
    </FormItem>
  )
}

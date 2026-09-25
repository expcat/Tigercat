import { useState } from 'react'
import { CronEditor } from '@expcat/tigercat-react/CronEditor'
import { FormItem } from '@expcat/tigercat-react/FormItem'

export default function App() {
  const [value, setValue] = useState('0 9 * * 1-5')

  return (
    <FormItem label="执行计划">
      <CronEditor value={value} onChange={(v) => setValue(v ?? '')} />
    </FormItem>
  )
}

import { useState } from 'react'
import { CronEditor } from '@expcat/tigercat-react/CronEditor'

export default function App() {
  const [value, setValue] = useState('0 9 * * 1-5')

  return <CronEditor value={value} onChange={setValue} ariaLabel="编辑执行计划" />
}

import { useState } from 'react'
import { RadioGroup } from '@expcat/tigercat-react/RadioGroup'

const options = [
  { label: '按月', value: 'monthly' },
  { label: '按年', value: 'yearly' },
  { label: '一次性', value: 'once', disabled: true }
]

export default function App() {
  const [value, setValue] = useState<string | number>('monthly')

  return <RadioGroup value={value} onChange={setValue} options={options} aria-label="订阅周期" />
}

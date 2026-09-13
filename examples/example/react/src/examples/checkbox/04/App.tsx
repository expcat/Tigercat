import { useState } from 'react'
import { CheckboxGroup } from '@expcat/tigercat-react/CheckboxGroup'

const options = [
  { label: '邮件', value: 'email' },
  { label: '短信', value: 'sms' },
  { label: '传真', value: 'fax', disabled: true }
]

export default function App() {
  const [values, setValues] = useState<(string | number | boolean)[]>(['email'])

  return (
    <CheckboxGroup value={values} onChange={setValues} options={options} aria-label="通知渠道" />
  )
}

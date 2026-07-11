import { useState } from 'react'
import { Checkbox } from '@expcat/tigercat-react/Checkbox'
import { CheckboxGroup } from '@expcat/tigercat-react/CheckboxGroup'

export default function App() {
  const [values, setValues] = useState<(string | number | boolean)[]>(['email'])

  return (
    <CheckboxGroup value={values} onChange={setValues} size="lg">
      <Checkbox value="email">邮件</Checkbox>
      <Checkbox value="sms">短信</Checkbox>
      <Checkbox value="app">应用内</Checkbox>
    </CheckboxGroup>
  )
}

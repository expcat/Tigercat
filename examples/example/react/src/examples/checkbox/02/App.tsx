import { useState } from 'react'
import { Checkbox } from '@expcat/tigercat-react/Checkbox'
import { CheckboxGroup } from '@expcat/tigercat-react/CheckboxGroup'

const options = ['email', 'sms', 'app'] as const

export default function App() {
  const [values, setValues] = useState<string[]>(['email'])
  const allChecked = values.length === options.length
  const indeterminate = values.length > 0 && !allChecked

  return (
    <div className="space-y-3">
      <Checkbox
        checked={allChecked}
        indeterminate={indeterminate}
        onChange={(checked) => setValues(checked ? [...options] : [])}>
        全选
      </Checkbox>
      <CheckboxGroup
        value={values}
        onChange={(next) => setValues(next.map(String))}
        aria-label="通知渠道">
        <Checkbox value="email">邮件</Checkbox>
        <Checkbox value="sms">短信</Checkbox>
        <Checkbox value="app">应用内</Checkbox>
      </CheckboxGroup>
    </div>
  )
}

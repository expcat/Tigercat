import { useState } from 'react'
import { Select } from '@expcat/tigercat-react/Select'

const options = [
  { label: '标准版', value: 'standard' },
  { label: '专业版', value: 'pro' },
  { label: '企业版（暂不可用）', value: 'enterprise', disabled: true }
]

export default function App() {
  const [value, setValue] = useState<string | number>('standard')

  return (
    <Select
      value={value}
      onChange={(next) => setValue(next ?? '')}
      options={options}
      clearable
      size="lg"
      className="w-full max-w-sm"
    />
  )
}

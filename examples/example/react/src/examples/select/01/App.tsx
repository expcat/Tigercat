import { useState } from 'react'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Select } from '@expcat/tigercat-react/Select'

const options = [
  { label: '标准版', value: 'standard' },
  { label: '专业版', value: 'pro' },
  { label: '企业版（暂不可用）', value: 'enterprise', disabled: true }
]

export default function App() {
  const [value, setValue] = useState<string | number | undefined>('standard')

  return (
    <FormItem label="套餐" className="w-full max-w-sm">
      <Select value={value} onChange={setValue} options={options} clearable size="lg" />
    </FormItem>
  )
}

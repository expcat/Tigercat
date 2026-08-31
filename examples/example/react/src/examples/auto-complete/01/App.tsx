import { useState } from 'react'
import { AutoComplete } from '@expcat/tigercat-react/AutoComplete'
import { FormItem } from '@expcat/tigercat-react/FormItem'

const options = ['React', 'Vue', 'Svelte', 'Angular'].map((value) => ({ label: value, value }))

export default function App() {
  const [value, setValue] = useState<string | number | undefined>()

  return (
    <FormItem label="框架" className="w-full max-w-sm">
      <AutoComplete
        value={value}
        onChange={setValue}
        options={options}
        placeholder="输入框架名称"
        clearable
      />
    </FormItem>
  )
}

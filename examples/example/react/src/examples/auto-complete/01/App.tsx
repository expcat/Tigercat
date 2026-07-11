import { useState } from 'react'
import { AutoComplete } from '@expcat/tigercat-react/AutoComplete'

const options = ['React', 'Vue', 'Svelte', 'Angular'].map((value) => ({ label: value, value }))

export default function App() {
  const [value, setValue] = useState('')

  return (
    <AutoComplete
      value={value}
      onChange={(next) => setValue(String(next))}
      options={options}
      placeholder="输入框架名称"
      className="w-full max-w-sm"
    />
  )
}

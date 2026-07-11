import { useState } from 'react'
import { AutoComplete } from '@expcat/tigercat-react/AutoComplete'

const allOptions = ['React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Preact', 'Next.js', 'Nuxt'].map(
  (o) => ({ label: o, value: o })
)

export default function App() {
  const [val, setVal] = useState('')

  const [val2, setVal2] = useState('')

  return (
    <>
      <AutoComplete
        value={val}
        onChange={(v) => setVal(String(v))}
        options={allOptions}
        placeholder="请输入搜索内容"
      />
    </>
  )
}

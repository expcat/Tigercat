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
        value={val2}
        onChange={(v) => setVal2(String(v))}
        options={allOptions.map((o) => ({ label: o.label + ' 框架', value: o.value }))}
        placeholder="自定义选项"
      />
    </>
  )
}

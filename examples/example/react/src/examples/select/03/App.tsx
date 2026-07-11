import { useState } from 'react'
import { Select } from '@expcat/tigercat-react/Select'

const skills = [
  { label: 'React', value: 'react' },
  { label: 'Vue', value: 'vue' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Node.js', value: 'node' }
]

export default function App() {
  const [value, setValue] = useState<(string | number)[]>(['typescript'])

  return (
    <Select
      value={value}
      onChange={setValue}
      options={skills}
      multiple
      searchable
      placeholder="搜索并多选技能"
      className="w-full max-w-sm"
    />
  )
}

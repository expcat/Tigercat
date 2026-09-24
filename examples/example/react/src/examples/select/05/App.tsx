import { useState } from 'react'
import { Select } from '@expcat/tigercat-react/Select'

const people = [
  { label: 'Ada', value: 'a', description: 'Pilot' },
  { label: 'Bea', value: 'b', description: 'Navigator' },
  { label: 'Cam', value: 'c', description: 'Engineer' }
]

export default function App() {
  const [value, setValue] = useState<string[]>([])
  return (
    <Select
      multiple
      searchable
      aria-label="People"
      className="w-full max-w-sm"
      maxCount={2}
      maxTagCount={1}
      options={people}
      value={value}
      onChange={setValue}
    />
  )
}

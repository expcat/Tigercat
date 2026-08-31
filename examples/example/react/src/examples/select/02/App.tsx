import { useState } from 'react'
import { Select } from '@expcat/tigercat-react/Select'

const cities = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '深圳', value: 'shenzhen' },
  { label: '杭州', value: 'hangzhou' }
]

export default function App() {
  const [value, setValue] = useState<string | number | undefined>(undefined)

  return (
    <Select
      value={value}
      onChange={setValue}
      options={cities}
      searchable
      className="w-full max-w-sm"
    />
  )
}

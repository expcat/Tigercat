import { useState } from 'react'
import { Select } from '@expcat/tigercat-react/Select'

const groupedOptions = [
  {
    label: '水果',
    options: [
      { label: '苹果', value: 'apple' },
      { label: '香蕉', value: 'banana' }
    ]
  },
  {
    label: '蔬菜',
    options: [
      { label: '番茄', value: 'tomato' },
      { label: '黄瓜', value: 'cucumber' }
    ]
  }
]

export default function App() {
  const [value, setValue] = useState<string | number | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  return (
    <Select
      value={value}
      onChange={setValue}
      options={groupedOptions}
      searchable
      creatable
      remote
      loading={loading}
      onSearchValueChange={() => {
        setLoading(true)
        window.setTimeout(() => setLoading(false), 240)
      }}
      className="w-full max-w-sm"
    />
  )
}

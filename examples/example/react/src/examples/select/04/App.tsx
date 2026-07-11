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
  const [value, setValue] = useState<string | number>('apple')

  return (
    <Select
      value={value}
      onChange={(next) => setValue(next ?? '')}
      options={groupedOptions}
      className="w-full max-w-sm"
    />
  )
}

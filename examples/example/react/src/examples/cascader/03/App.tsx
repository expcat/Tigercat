import { useState } from 'react'
import { Cascader } from '@expcat/tigercat-react/Cascader'

const options = [
  {
    label: '华东',
    value: 'east',
    children: [
      { label: '上海', value: 'shanghai' },
      { label: '杭州', value: 'hangzhou' }
    ]
  },
  {
    label: '华南',
    value: 'south',
    children: [{ label: '广州', value: 'guangzhou' }]
  }
]

export default function App() {
  const [value, setValue] = useState<(string | number)[] | undefined>(undefined)

  return (
    <Cascader
      value={value}
      onChange={setValue}
      options={options}
      changeOnSelect
      expandTrigger="hover"
      className="w-full max-w-sm"
    />
  )
}

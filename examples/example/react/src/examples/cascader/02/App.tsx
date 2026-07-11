import { useState } from 'react'
import { Cascader } from '@expcat/tigercat-react/Cascader'

const options = [
  {
    label: '产品',
    value: 'product',
    children: [
      { label: '设计', value: 'design' },
      { label: '运营', value: 'operations' }
    ]
  },
  {
    label: '研发',
    value: 'engineering',
    children: [
      { label: '前端', value: 'frontend' },
      { label: '后端', value: 'backend' }
    ]
  }
]

export default function App() {
  const [value, setValue] = useState<(string | number)[]>([])

  return (
    <Cascader
      value={value}
      onChange={setValue}
      options={options}
      searchable
      placeholder="搜索部门"
      className="w-full max-w-sm"
    />
  )
}

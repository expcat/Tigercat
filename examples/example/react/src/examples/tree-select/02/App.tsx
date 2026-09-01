import { useState } from 'react'
import { TreeSelect, type TreeSelectValue } from '@expcat/tigercat-react/TreeSelect'

const treeData = [
  {
    key: 'china',
    label: '中国',
    children: [
      { key: 'beijing', label: '北京' },
      { key: 'shanghai', label: '上海' }
    ]
  },
  { key: 'singapore', label: '新加坡' }
]

export default function App() {
  const [value, setValue] = useState<TreeSelectValue>(undefined)

  return (
    <TreeSelect
      value={value}
      onChange={setValue}
      treeData={treeData}
      searchable
      clearable
      className="w-full max-w-sm"
    />
  )
}

import { useState } from 'react'
import type { TreeSelectValue } from '@expcat/tigercat-core'
import { TreeSelect } from '@expcat/tigercat-react/TreeSelect'

const treeData = [
  {
    key: 'china',
    label: '中国',
    value: 'china',
    children: [
      { key: 'beijing', label: '北京', value: 'beijing' },
      { key: 'shanghai', label: '上海', value: 'shanghai' }
    ]
  },
  { key: 'singapore', label: '新加坡', value: 'singapore' }
]

export default function App() {
  const [value, setValue] = useState<TreeSelectValue>('')

  return (
    <TreeSelect
      value={value}
      onChange={setValue}
      treeData={treeData}
      searchable
      placeholder="搜索地区"
      className="w-full max-w-sm"
    />
  )
}

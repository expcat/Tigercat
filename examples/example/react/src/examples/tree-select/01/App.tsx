import { useState } from 'react'
import type { TreeSelectValue } from '@expcat/tigercat-core'
import { TreeSelect } from '@expcat/tigercat-react/TreeSelect'

const treeData = [
  {
    key: 'engineering',
    label: '研发部',
    value: 'engineering',
    children: [
      { key: 'frontend', label: '前端组', value: 'frontend' },
      { key: 'backend', label: '后端组', value: 'backend' }
    ]
  },
  { key: 'product', label: '产品部', value: 'product' }
]

export default function App() {
  const [value, setValue] = useState<TreeSelectValue>('')

  return (
    <TreeSelect
      value={value}
      onChange={setValue}
      treeData={treeData}
      placeholder="请选择团队"
      className="w-full max-w-sm"
    />
  )
}

import { useState } from 'react'
import { TreeSelect } from '@expcat/tigercat-react/TreeSelect'

const treeData = [
  {
    key: 'eng',
    label: '工程',
    children: [
      { key: 'fe', label: '前端' },
      { key: 'be', label: '后端' }
    ]
  },
  { key: 'design', label: '设计' }
]

export default function App() {
  const [value, setValue] = useState<(string | number)[] | undefined>(undefined)

  return (
    <TreeSelect
      value={value}
      onChange={setValue}
      treeData={treeData}
      multiple
      defaultExpandAll
      className="w-full max-w-sm"
    />
  )
}

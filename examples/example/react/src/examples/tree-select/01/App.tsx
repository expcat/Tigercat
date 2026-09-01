import { useState } from 'react'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { TreeSelect, type TreeSelectValue } from '@expcat/tigercat-react/TreeSelect'

const treeData = [
  {
    key: 'engineering',
    label: '研发部',
    children: [
      { key: 'frontend', label: '前端组' },
      { key: 'backend', label: '后端组' }
    ]
  },
  { key: 'product', label: '产品部' }
]

export default function App() {
  const [value, setValue] = useState<TreeSelectValue>(undefined)

  return (
    <FormItem label="团队" className="w-full max-w-sm">
      <TreeSelect value={value} onChange={setValue} treeData={treeData} defaultExpandAll />
    </FormItem>
  )
}

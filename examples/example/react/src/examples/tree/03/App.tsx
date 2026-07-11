import { useState } from 'react'
import { Input } from '@expcat/tigercat-react/Input'
import { Tree } from '@expcat/tigercat-react/Tree'
import type { TreeNode } from '@expcat/tigercat-react'

const treeData: TreeNode[] = [
  {
    key: 'frameworks',
    label: 'Frameworks',
    children: [
      { key: 'react', label: 'React' },
      { key: 'vue', label: 'Vue' }
    ]
  },
  { key: 'tooling', label: 'Tooling' }
]

export default function App() {
  const [filterValue, setFilterValue] = useState('')

  return (
    <div className="space-y-3">
      <Input
        value={filterValue}
        onChange={(event) => setFilterValue(event.target.value)}
        placeholder="搜索节点"
      />
      <Tree treeData={treeData} filterValue={filterValue} defaultExpandAll />
    </div>
  )
}

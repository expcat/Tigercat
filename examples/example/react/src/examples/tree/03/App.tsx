import { Tree } from '@expcat/tigercat-react/Tree'
import type { TreeNode } from '@expcat/tigercat-react'

const treeData: TreeNode[] = Array.from({ length: 8 }, (_, group) => ({
  key: `g-${group}`,
  label: `分组 ${group + 1}`,
  children: Array.from({ length: 8 }, (_, i) => ({
    key: `g-${group}-${i}`,
    label: `节点 ${group + 1}-${i + 1}`
  }))
}))

export default function App() {
  return (
    <Tree
      treeData={treeData}
      searchable
      showLine
      virtual
      height={240}
      itemHeight={32}
      defaultExpandAll
      aria-label="虚拟树"
    />
  )
}

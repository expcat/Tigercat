import { useState } from 'react'
import { Tree } from '@expcat/tigercat-react/Tree'
import type { TreeNode } from '@expcat/tigercat-react'

const initialTree: TreeNode[] = [
  { key: 'design', label: '设计', isLeaf: false },
  { key: 'broken', label: '会失败的节点', isLeaf: false }
]

const loadChildren = (node: TreeNode): Promise<TreeNode[]> =>
  new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (node.key === 'broken') {
        reject(new Error('load failed'))
        return
      }
      resolve([
        { key: `${node.key}-1`, label: `${node.label}子项 1`, isLeaf: true },
        { key: `${node.key}-2`, label: `${node.label}子项 2`, isLeaf: true }
      ])
    }, 400)
  })

export default function App() {
  const [treeData, setTreeData] = useState(initialTree)

  return (
    <Tree
      treeData={treeData}
      loadData={loadChildren}
      onTreeDataChange={setTreeData}
      aria-label="懒加载树"
    />
  )
}

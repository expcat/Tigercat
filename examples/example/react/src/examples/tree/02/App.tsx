import { Tree } from '@expcat/tigercat-react/Tree'
import type { TreeNode } from '@expcat/tigercat-react'

const treeData: TreeNode[] = [
  { key: 'design', label: '设计' },
  { key: 'development', label: '开发' }
]

const loadChildren = (node: TreeNode): Promise<TreeNode[]> =>
  new Promise((resolve) => {
    window.setTimeout(
      () =>
        resolve([
          { key: String(node.key) + '-1', label: node.label + '子项 1', isLeaf: true },
          { key: String(node.key) + '-2', label: node.label + '子项 2', isLeaf: true }
        ]),
      500
    )
  })

export default function App() {
  return <Tree treeData={treeData} loadData={loadChildren} />
}

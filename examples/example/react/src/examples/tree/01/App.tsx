import { Tree } from '@expcat/tigercat-react/Tree'
import type { TreeNode } from '@expcat/tigercat-react'

const treeData: TreeNode[] = [
  {
    key: 'design',
    label: '设计',
    children: [
      { key: 'ui', label: '界面设计' },
      { key: 'ux', label: '体验设计' }
    ]
  },
  { key: 'development', label: '开发' }
]

export default function App() {
  return <Tree treeData={treeData} defaultExpandAll aria-label="项目结构" />
}

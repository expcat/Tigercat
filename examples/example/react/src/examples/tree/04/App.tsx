import { Input } from '@expcat/tigercat-react/Input'
import { useState } from 'react'
import { Tree } from '@expcat/tigercat-react/Tree'
import type { TreeNode } from '@expcat/tigercat-react'

export default function App() {
  // Basic tree data
  const basicTreeData: TreeNode[] = [
    {
      key: '1',
      label: '父节点 1',
      children: [
        { key: '1-1', label: '子节点 1-1' },
        { key: '1-2', label: '子节点 1-2' }
      ]
    },
    {
      key: '2',
      label: '父节点 2',
      children: [
        { key: '2-1', label: '子节点 2-1' },
        {
          key: '2-2',
          label: '子节点 2-2',
          children: [
            { key: '2-2-1', label: '子节点 2-2-1' },
            { key: '2-2-2', label: '子节点 2-2-2' }
          ]
        }
      ]
    }
  ]

  // Checkable tree data
  const [checkedKeys, setCheckedKeys] = useState<(string | number)[]>(['1-1'])

  const [checkedKeysStrictly, setCheckedKeysStrictly] = useState<(string | number)[]>(['1-1'])

  // Selectable tree data
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(['1-1'])

  // Tree with disabled nodes
  const disabledTreeData: TreeNode[] = [
    {
      key: '1',
      label: '父节点 1',
      children: [
        { key: '1-1', label: '子节点 1-1' },
        { key: '1-2', label: '子节点 1-2 (禁用)', disabled: true }
      ]
    },
    {
      key: '2',
      label: '父节点 2 (禁用)',
      disabled: true,
      children: [{ key: '2-1', label: '子节点 2-1' }]
    }
  ]

  // Lazy loading tree data
  const lazyTreeData: TreeNode[] = [
    { key: '1', label: '父节点 1' },
    { key: '2', label: '父节点 2' },
    { key: '3', label: '父节点 3' }
  ]

  const loadChildren = async (node: TreeNode): Promise<TreeNode[]> => {
    // Simulate async loading
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { key: `${node.key}-1`, label: `${node.label} - 子节点 1` },
          { key: `${node.key}-2`, label: `${node.label} - 子节点 2` },
          { key: `${node.key}-3`, label: `${node.label} - 子节点 3` }
        ])
      }, 1000)
    })
  }

  // Filter tree
  const [filterValue, setFilterValue] = useState('')

  const filterTreeData: TreeNode[] = [
    {
      key: '1',
      label: 'Apple',
      children: [
        { key: '1-1', label: 'iPhone' },
        { key: '1-2', label: 'iPad' },
        { key: '1-3', label: 'MacBook' }
      ]
    },
    {
      key: '2',
      label: 'Microsoft',
      children: [
        { key: '2-1', label: 'Surface' },
        { key: '2-2', label: 'Xbox' }
      ]
    },
    {
      key: '3',
      label: 'Google',
      children: [
        { key: '3-1', label: 'Pixel' },
        { key: '3-2', label: 'Chromebook' }
      ]
    }
  ]

  // Multiple selection
  const [multiSelectedKeys, setMultiSelectedKeys] = useState<(string | number)[]>([])

  // Controlled expanded keys
  const [controlledExpandedKeys, setControlledExpandedKeys] = useState<(string | number)[]>(['1'])

  const handleSelect = (keys: (string | number)[]) => {
    setSelectedKeys(keys)
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">连接线</h3>
          <Tree treeData={basicTreeData} showLine defaultExpandAll />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            多选（selectionMode）
          </h3>
          <p className="text-sm text-gray-600 mb-4">已选择: {multiSelectedKeys.join(', ')}</p>
          <Tree
            treeData={basicTreeData}
            selectionMode="multiple"
            defaultExpandAll
            selectedKeys={multiSelectedKeys}
            onSelectedKeysChange={setMultiSelectedKeys}
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">受控展开</h3>
          <p className="text-sm text-gray-600 mb-4">
            展开节点: {controlledExpandedKeys.join(', ')}
          </p>
          <Tree
            treeData={basicTreeData}
            expandedKeys={controlledExpandedKeys}
            onExpandedKeysChange={setControlledExpandedKeys}
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">空数据</h3>
          <Tree treeData={[]} emptyText="暂无数据" />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Block 节点</h3>
          <p className="text-sm text-gray-600 mb-4">节点占据整行宽度</p>
          <Tree treeData={basicTreeData} blockNode defaultExpandAll />
        </div>
      </div>
    </>
  )
}

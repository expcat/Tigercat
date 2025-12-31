import { useState } from 'react'
import { Tree, Card, Space, Input } from '@tigercat/react'
import type { TreeNode } from '@tigercat/react'

export default function TreeDemo() {
  // Basic tree data
  const basicTreeData: TreeNode[] = [
    {
      key: '1',
      label: '父节点 1',
      children: [
        { key: '1-1', label: '子节点 1-1' },
        { key: '1-2', label: '子节点 1-2' },
      ],
    },
    {
      key: '2',
      label: '父节点 2',
      children: [
        { key: '2-1', label: '子节点 2-1' },
        { key: '2-2', label: '子节点 2-2', children: [
          { key: '2-2-1', label: '子节点 2-2-1' },
          { key: '2-2-2', label: '子节点 2-2-2' },
        ]},
      ],
    },
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
        { key: '1-2', label: '子节点 1-2 (禁用)', disabled: true },
      ],
    },
    {
      key: '2',
      label: '父节点 2 (禁用)',
      disabled: true,
      children: [
        { key: '2-1', label: '子节点 2-1' },
      ],
    },
  ]

  // Lazy loading tree data
  const lazyTreeData: TreeNode[] = [
    { key: '1', label: '父节点 1' },
    { key: '2', label: '父节点 2' },
    { key: '3', label: '父节点 3' },
  ]

  const loadChildren = async (node: TreeNode): Promise<TreeNode[]> => {
    // Simulate async loading
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { key: `${node.key}-1`, label: `${node.label} - 子节点 1` },
          { key: `${node.key}-2`, label: `${node.label} - 子节点 2` },
          { key: `${node.key}-3`, label: `${node.label} - 子节点 3` },
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
        { key: '1-3', label: 'MacBook' },
      ],
    },
    {
      key: '2',
      label: 'Microsoft',
      children: [
        { key: '2-1', label: 'Surface' },
        { key: '2-2', label: 'Xbox' },
      ],
    },
    {
      key: '3',
      label: 'Google',
      children: [
        { key: '3-1', label: 'Pixel' },
        { key: '3-2', label: 'Chromebook' },
      ],
    },
  ]

  const handleSelect = (keys: (string | number)[]) => {
    setSelectedKeys(keys)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tree 树形控件</h1>
      <p className="text-gray-600 mb-8">用于展示层级结构的树形数据。</p>

      <Space direction="vertical" size="lg" className="w-full">
        {/* 基本用法 */}
        <Card header={<h3 className="text-lg font-semibold">基本用法</h3>}>
          <Tree treeData={basicTreeData} />
        </Card>

        {/* 默认展开所有节点 */}
        <Card header={<h3 className="text-lg font-semibold">默认展开所有节点</h3>}>
          <Tree treeData={basicTreeData} defaultExpandAll />
        </Card>

        {/* 可选择的树 */}
        <Card header={<h3 className="text-lg font-semibold">可选择的树</h3>}>
          <p className="text-sm text-gray-600 mb-4">已选择: {selectedKeys.join(', ')}</p>
          <Tree 
            treeData={basicTreeData} 
            selectable
            selectedKeys={selectedKeys}
            onSelect={handleSelect}
          />
        </Card>

        {/* 多选树（级联） */}
        <Card header={<h3 className="text-lg font-semibold">多选树（级联）</h3>}>
          <p className="text-sm text-gray-600 mb-4">已勾选: {checkedKeys.join(', ')}</p>
          <Tree 
            treeData={basicTreeData} 
            checkable
            defaultExpandAll
            checkedKeys={checkedKeys}
            onCheck={(keys) => setCheckedKeys(keys)}
          />
        </Card>

        {/* 多选树（父子独立） */}
        <Card header={<h3 className="text-lg font-semibold">多选树（父子独立）</h3>}>
          <p className="text-sm text-gray-600 mb-4">已勾选: {checkedKeysStrictly.join(', ')}</p>
          <Tree 
            treeData={basicTreeData} 
            checkable
            checkStrictly
            defaultExpandAll
            checkedKeys={checkedKeysStrictly}
            onCheck={(keys) => setCheckedKeysStrictly(keys)}
          />
        </Card>

        {/* 禁用节点 */}
        <Card header={<h3 className="text-lg font-semibold">禁用节点</h3>}>
          <Tree treeData={disabledTreeData} checkable defaultExpandAll />
        </Card>

        {/* 懒加载 */}
        <Card header={<h3 className="text-lg font-semibold">懒加载</h3>}>
          <p className="text-sm text-gray-600 mb-4">点击节点展开，动态加载子节点</p>
          <Tree treeData={lazyTreeData} loadData={loadChildren} />
        </Card>

        {/* 节点过滤 */}
        <Card header={<h3 className="text-lg font-semibold">节点过滤</h3>}>
          <Input 
            value={filterValue} 
            onChange={(e) => setFilterValue(e.target.value)}
            placeholder="搜索节点..." 
            className="mb-4"
          />
          <Tree treeData={filterTreeData} filterValue={filterValue} />
        </Card>

        {/* Block 节点 */}
        <Card header={<h3 className="text-lg font-semibold">Block 节点</h3>}>
          <p className="text-sm text-gray-600 mb-4">节点占据整行宽度</p>
          <Tree treeData={basicTreeData} blockNode defaultExpandAll />
        </Card>
      </Space>
    </div>
  )
}

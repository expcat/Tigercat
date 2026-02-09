import { useState } from 'react'
import { Tree, Input } from '@expcat/tigercat-react'
import type { TreeNode } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

export default function TreeDemo() {
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

  const basicSnippet = `<Tree treeData={basicTreeData} ariaLabel="Tree 基本用法" />`

  const expandAllSnippet = `<Tree treeData={basicTreeData} defaultExpandAll />`

  const selectableSnippet = `<p className="text-sm text-gray-600 mb-4">已选择: {selectedKeys.join(', ')}</p>
<Tree
  treeData={basicTreeData}
  selectable
  selectedKeys={selectedKeys}
  onSelect={handleSelect}
/>`

  const checkableSnippet = `<p className="text-sm text-gray-600 mb-4">已勾选: {checkedKeys.join(', ')}</p>
<Tree
  treeData={basicTreeData}
  checkable
  defaultExpandAll
  checkedKeys={checkedKeys}
  onCheck={(keys) => setCheckedKeys(keys)}
/>`

  const checkStrictlySnippet = `<p className="text-sm text-gray-600 mb-4">已勾选: {checkedKeysStrictly.join(', ')}</p>
<Tree
  treeData={basicTreeData}
  checkable
  checkStrictly
  defaultExpandAll
  checkedKeys={checkedKeysStrictly}
  onCheck={(keys) => setCheckedKeysStrictly(keys)}
/>`

  const disabledSnippet = `<Tree treeData={disabledTreeData} checkable defaultExpandAll />`

  const lazySnippet = `<p className="text-sm text-gray-600 mb-4">点击节点展开，动态加载子节点</p>
<Tree treeData={lazyTreeData} loadData={loadChildren} />`

  const filterSnippet = `<Input
  value={filterValue}
  onChange={(e) => setFilterValue(e.target.value)}
  placeholder="搜索节点..."
  className="mb-4"
/>
<Tree treeData={filterTreeData} filterValue={filterValue} ariaLabel="Tree 节点过滤" />`

  const showLineSnippet = `<Tree treeData={basicTreeData} showLine defaultExpandAll />`

  const multiSelectSnippet = `<p className="text-sm text-gray-600 mb-4">已选择: {multiSelectedKeys.join(', ')}</p>
<Tree
  treeData={basicTreeData}
  selectionMode="multiple"
  defaultExpandAll
  selectedKeys={multiSelectedKeys}
  onSelect={(keys) => setMultiSelectedKeys(keys)}
/>`

  const controlledExpandSnippet = `<p className="text-sm text-gray-600 mb-4">展开节点: {controlledExpandedKeys.join(', ')}</p>
<Tree
  treeData={basicTreeData}
  expandedKeys={controlledExpandedKeys}
  onExpand={(keys) => setControlledExpandedKeys(keys)}
/>`

  const emptySnippet = `<Tree treeData={[]} emptyText="暂无数据" />`

  const blockSnippet = `<p className="text-sm text-gray-600 mb-4">节点占据整行宽度</p>
<Tree treeData={basicTreeData} blockNode defaultExpandAll />`

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tree 树形控件</h1>
      <p className="text-gray-600 mb-2">用于展示层级结构的树形数据。</p>
      <p className="text-sm text-gray-600 mb-8">
        键盘：方向键移动焦点，Enter 选择，Space 勾选，Escape 收拢。
      </p>

      <DemoBlock title="基本用法" description="基础树形结构展示。" code={basicSnippet}>
        <Tree treeData={basicTreeData} ariaLabel="Tree 基本用法" />
      </DemoBlock>

      <DemoBlock title="默认展开所有节点" description="初始展开全部节点。" code={expandAllSnippet}>
        <Tree treeData={basicTreeData} defaultExpandAll />
      </DemoBlock>

      <DemoBlock
        title="可选择的树"
        description="支持选择节点并回显选中结果。"
        code={selectableSnippet}>
        <p className="text-sm text-gray-600 mb-4">已选择: {selectedKeys.join(', ')}</p>
        <Tree
          treeData={basicTreeData}
          selectable
          selectedKeys={selectedKeys}
          onSelect={handleSelect}
        />
      </DemoBlock>

      <DemoBlock title="多选树（级联）" description="勾选节点时父子联动。" code={checkableSnippet}>
        <p className="text-sm text-gray-600 mb-4">已勾选: {checkedKeys.join(', ')}</p>
        <Tree
          treeData={basicTreeData}
          checkable
          defaultExpandAll
          checkedKeys={checkedKeys}
          onCheck={(keys) => setCheckedKeys(keys)}
        />
      </DemoBlock>

      <DemoBlock
        title="多选树（父子独立）"
        description="父子节点勾选状态相互独立。"
        code={checkStrictlySnippet}>
        <p className="text-sm text-gray-600 mb-4">已勾选: {checkedKeysStrictly.join(', ')}</p>
        <Tree
          treeData={basicTreeData}
          checkable
          checkStrictly
          defaultExpandAll
          checkedKeys={checkedKeysStrictly}
          onCheck={(keys) => setCheckedKeysStrictly(keys)}
        />
      </DemoBlock>

      <DemoBlock title="禁用节点" description="为特定节点设置禁用状态。" code={disabledSnippet}>
        <Tree treeData={disabledTreeData} checkable defaultExpandAll />
      </DemoBlock>

      <DemoBlock title="懒加载" description="展开节点时动态加载子节点。" code={lazySnippet}>
        <p className="text-sm text-gray-600 mb-4">点击节点展开，动态加载子节点</p>
        <Tree treeData={lazyTreeData} loadData={loadChildren} />
      </DemoBlock>

      <DemoBlock title="节点过滤" description="根据关键字过滤节点。" code={filterSnippet}>
        <Input
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder="搜索节点..."
          className="mb-4"
        />
        <Tree treeData={filterTreeData} filterValue={filterValue} ariaLabel="Tree 节点过滤" />
      </DemoBlock>

      <DemoBlock title="连接线" description="显示节点连接线。" code={showLineSnippet}>
        <Tree treeData={basicTreeData} showLine defaultExpandAll />
      </DemoBlock>

      <DemoBlock
        title="多选（selectionMode）"
        description="通过 selectionMode='multiple' 支持多选。"
        code={multiSelectSnippet}>
        <p className="text-sm text-gray-600 mb-4">已选择: {multiSelectedKeys.join(', ')}</p>
        <Tree
          treeData={basicTreeData}
          selectionMode="multiple"
          defaultExpandAll
          selectedKeys={multiSelectedKeys}
          onSelect={(keys) => setMultiSelectedKeys(keys)}
        />
      </DemoBlock>

      <DemoBlock
        title="受控展开"
        description="通过 expandedKeys 外部控制展开状态。"
        code={controlledExpandSnippet}>
        <p className="text-sm text-gray-600 mb-4">展开节点: {controlledExpandedKeys.join(', ')}</p>
        <Tree
          treeData={basicTreeData}
          expandedKeys={controlledExpandedKeys}
          onExpand={(keys) => setControlledExpandedKeys(keys)}
        />
      </DemoBlock>

      <DemoBlock title="空数据" description="自定义空数据提示文案。" code={emptySnippet}>
        <Tree treeData={[]} emptyText="暂无数据" />
      </DemoBlock>

      <DemoBlock title="Block 节点" description="节点占据整行宽度。" code={blockSnippet}>
        <p className="text-sm text-gray-600 mb-4">节点占据整行宽度</p>
        <Tree treeData={basicTreeData} blockNode defaultExpandAll />
      </DemoBlock>
    </div>
  )
}

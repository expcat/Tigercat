import { Input } from '@expcat/tigercat-react/Input'
import { useState } from 'react'
import { Tree } from '@expcat/tigercat-react/Tree'
import type { TreeNode } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './TreeDemo.tsx?raw'

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
  onCheckedKeysChange={setCheckedKeys}
/>`

  const checkStrictlySnippet = `<p className="text-sm text-gray-600 mb-4">已勾选: {checkedKeysStrictly.join(', ')}</p>
<Tree
  treeData={basicTreeData}
  checkable
  checkStrictly
  defaultExpandAll
  checkedKeys={checkedKeysStrictly}
  onCheckedKeysChange={setCheckedKeysStrictly}
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
  onSelectedKeysChange={setMultiSelectedKeys}
/>`

  const controlledExpandSnippet = `<p className="text-sm text-gray-600 mb-4">展开节点: {controlledExpandedKeys.join(', ')}</p>
<Tree
  treeData={basicTreeData}
  expandedKeys={controlledExpandedKeys}
  onExpandedKeysChange={setControlledExpandedKeys}
/>`

  const emptySnippet = `<Tree treeData={[]} emptyText="暂无数据" />`

  const blockSnippet = `<p className="text-sm text-gray-600 mb-4">节点占据整行宽度</p>
<Tree treeData={basicTreeData} blockNode defaultExpandAll />`

  const basicScriptSnippet = `const [checkedKeys, setCheckedKeys] = useState<(string | number)[]>(['1-1'])
const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(['1-1'])`

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tree 树形控件</h1>
      <p className="text-gray-600 mb-2">用于展示层级结构的树形数据。</p>
      <p className="text-sm text-gray-600 mb-8">
        键盘：方向键移动焦点，Enter 选择，Space 勾选，Escape 收拢。
      </p>

      <DemoBlock
        title="基本用法等组合展示"
        description="合并展示基本用法、默认展开所有节点、可选择的树等互不冲突的使用方式。"
        code={fullPageSnippet}>
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
            <Tree treeData={basicTreeData} ariaLabel="Tree 基本用法" />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              默认展开所有节点
            </h3>
            <Tree treeData={basicTreeData} defaultExpandAll />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">可选择的树</h3>
            <p className="text-sm text-gray-600 mb-4">已选择: {selectedKeys.join(', ')}</p>
            <Tree
              treeData={basicTreeData}
              selectable
              selectedKeys={selectedKeys}
              onSelect={handleSelect}
            />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              多选树（级联）
            </h3>
            <p className="text-sm text-gray-600 mb-4">已勾选: {checkedKeys.join(', ')}</p>
            <Tree
              treeData={basicTreeData}
              checkable
              defaultExpandAll
              checkedKeys={checkedKeys}
              onCheckedKeysChange={setCheckedKeys}
            />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              多选树（父子独立）
            </h3>
            <p className="text-sm text-gray-600 mb-4">已勾选: {checkedKeysStrictly.join(', ')}</p>
            <Tree
              treeData={basicTreeData}
              checkable
              checkStrictly
              defaultExpandAll
              checkedKeys={checkedKeysStrictly}
              onCheckedKeysChange={setCheckedKeysStrictly}
            />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用节点</h3>
            <Tree treeData={disabledTreeData} checkable defaultExpandAll />
          </div>
        </div>
      </DemoBlock>

      <DemoBlock title="懒加载" description="展开节点时动态加载子节点。" code={fullPageSnippet}>
        <p className="text-sm text-gray-600 mb-4">点击节点展开，动态加载子节点</p>
        <Tree treeData={lazyTreeData} loadData={loadChildren} />
      </DemoBlock>

      <DemoBlock title="节点过滤" description="根据关键字过滤节点。" code={fullPageSnippet}>
        <Input
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
          placeholder="搜索节点..."
          className="mb-4"
        />
        <Tree treeData={filterTreeData} filterValue={filterValue} ariaLabel="Tree 节点过滤" />
      </DemoBlock>

      <DemoBlock
        title="连接线等组合展示"
        description="合并展示连接线、多选（selectionMode）、受控展开等互不冲突的使用方式。"
        code={fullPageSnippet}>
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
      </DemoBlock>
    </div>
  )
}

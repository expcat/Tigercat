import { useState } from 'react'
import type { TreeSelectValue } from '@expcat/tigercat-core'
import { TreeSelect, Space } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const treeData = [
  { key: 'dev', label: '研发部', value: 'dev', children: [
    { key: 'fe', label: '前端组', value: 'fe', children: [{ key: 'zs', label: '张三', value: 'zs' }, { key: 'ls', label: '李四', value: 'ls' }] },
    { key: 'be', label: '后端组', value: 'be', children: [{ key: 'ww', label: '王五', value: 'ww' }] }
  ] },
  { key: 'pm', label: '产品部', value: 'pm', children: [{ key: 'zl', label: '赵六', value: 'zl' }] }
]

const basicSnippet = `<TreeSelect value={val} onChange={setVal} treeData={treeData} placeholder="请选择成员" />`
const searchSnippet = `<TreeSelect value={val} onChange={setVal} treeData={treeData} placeholder="搜索成员" showSearch />`
const sizeSnippet = `<TreeSelect treeData={treeData} size="sm" placeholder="小" />
<TreeSelect treeData={treeData} size="lg" placeholder="大" />
<TreeSelect treeData={treeData} disabled placeholder="禁用" />`

const TreeSelectDemo: React.FC = () => {
  const [val, setVal] = useState<TreeSelectValue>(undefined as unknown as TreeSelectValue)
  const [val2, setVal2] = useState<TreeSelectValue>(undefined as unknown as TreeSelectValue)

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">TreeSelect 树选择</h1>
      <p className="text-gray-500 mb-8">树形结构选择器，适用于组织架构等层级数据。</p>

      <DemoBlock title="基本用法" code={basicSnippet}>
        <TreeSelect value={val} onChange={setVal} treeData={treeData} placeholder="请选择成员" />
      </DemoBlock>

      <DemoBlock title="可搜索" description="showSearch 开启搜索" code={searchSnippet}>
        <TreeSelect value={val2} onChange={setVal2} treeData={treeData} placeholder="搜索成员" showSearch />
      </DemoBlock>

      <DemoBlock title="尺寸与禁用" code={sizeSnippet}>
        <Space direction="vertical" size={12}>
          <TreeSelect treeData={treeData} size="sm" placeholder="小" />
          <TreeSelect treeData={treeData} size="lg" placeholder="大" />
          <TreeSelect treeData={treeData} disabled placeholder="禁用" />
        </Space>
      </DemoBlock>
    </div>
  )
}

export default TreeSelectDemo

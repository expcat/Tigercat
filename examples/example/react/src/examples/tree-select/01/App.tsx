import { Space } from '@expcat/tigercat-react/Space'
import { useState } from 'react'
import type { TreeSelectValue } from '@expcat/tigercat-core'
import { TreeSelect } from '@expcat/tigercat-react/TreeSelect'

const treeData = [
  {
    key: 'dev',
    label: '研发部',
    value: 'dev',
    children: [
      {
        key: 'fe',
        label: '前端组',
        value: 'fe',
        children: [
          { key: 'zs', label: '张三', value: 'zs' },
          { key: 'ls', label: '李四', value: 'ls' }
        ]
      },
      {
        key: 'be',
        label: '后端组',
        value: 'be',
        children: [{ key: 'ww', label: '王五', value: 'ww' }]
      }
    ]
  },
  { key: 'pm', label: '产品部', value: 'pm', children: [{ key: 'zl', label: '赵六', value: 'zl' }] }
]

export default function App() {
  const [val, setVal] = useState<TreeSelectValue>(undefined as unknown as TreeSelectValue)

  const [val2, setVal2] = useState<TreeSelectValue>(undefined as unknown as TreeSelectValue)

  return (
    <>
      <TreeSelect value={val} onChange={setVal} treeData={treeData} placeholder="请选择成员" />
    </>
  )
}

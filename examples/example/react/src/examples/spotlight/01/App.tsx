import { Spotlight } from '@expcat/tigercat-react/Spotlight'
import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { type SpotlightItem } from '@expcat/tigercat-react'

const commands: SpotlightItem[] = [
  {
    key: 'dashboard',
    label: '打开仪表盘',
    description: '查看关键指标与待办事项',
    group: '导航',
    keywords: ['home', 'metrics'],
    shortcut: ['⌘', 'D']
  },
  {
    key: 'customers',
    label: '客户列表',
    description: '进入客户管理视图',
    group: '导航',
    keywords: ['crm'],
    shortcut: ['⌘', 'U']
  },
  {
    key: 'invite',
    label: '邀请成员',
    description: '向团队空间添加新成员',
    group: '操作',
    shortcut: ['⌘', 'I']
  },
  {
    key: 'billing',
    label: '账单设置',
    description: '当前计划不允许修改',
    group: '设置',
    disabled: true
  }
]

export default function App() {
  const [open, setOpen] = useState(false)

  const [controlledOpen, setControlledOpen] = useState(false)

  const [query, setQuery] = useState('')

  const [selected, setSelected] = useState('')

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setOpen(true)}>打开命令面板</Button>
            {selected && <span className="text-sm text-gray-500">已选择：{selected}</span>}
          </div>
          <Spotlight
            open={open}
            items={commands}
            title="命令面板"
            placeholder="搜索页面或操作"
            emptyText="没有匹配命令"
            onOpenChange={setOpen}
            onSelect={(item) => setSelected(item.label)}
          />
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">受控搜索</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => setControlledOpen(true)}>
              打开受控面板
            </Button>
            <span className="text-sm text-gray-500">当前查询：{query || '空'}</span>
          </div>
          <Spotlight
            open={controlledOpen}
            query={query}
            items={commands}
            title="受控命令面板"
            placeholder="输入 help、crm 或设置"
            onOpenChange={setControlledOpen}
            onQueryChange={setQuery}
            closeOnSelect={false}
          />
        </div>
      </div>
    </>
  )
}

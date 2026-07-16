import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Spotlight } from '@expcat/tigercat-react/Spotlight'
import type { SpotlightItem, SpotlightItemFilter } from '@expcat/tigercat-core'

const items: SpotlightItem[] = [
  {
    key: 'settings',
    label: '打开偏好设置',
    description: '调整主题、语言和通知',
    group: '导航',
    shortcut: ['⌘', ','],
    data: { aliases: ['config', '配置'] }
  },
  {
    key: 'invite',
    label: '邀请团队成员',
    description: '创建并复制邀请链接',
    group: '操作',
    shortcut: ['G', 'I'],
    data: { aliases: ['member', 'team'] }
  },
  {
    key: 'billing',
    label: '管理账单',
    description: '当前账号没有账单管理权限',
    group: '操作',
    shortcut: ['G', 'B'],
    disabled: true,
    data: { aliases: ['payment', 'invoice'] }
  }
]

const filterItem: SpotlightItemFilter = (query, item) => {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const aliases = (item.data as { aliases?: string[] } | undefined)?.aliases ?? []
  return [item.label, item.description ?? '', item.group ?? '', ...aliases].some((value) =>
    value.toLowerCase().includes(normalized)
  )
}

export default function App() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('尚未选择命令')

  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen(true)}>打开高级命令面板</Button>
      <p className="text-sm text-gray-500" aria-live="polite">
        {selected}；可尝试搜索别名 config 或 team。
      </p>
      <Spotlight
        open={open}
        query={query}
        items={items}
        title="工作区命令"
        placeholder="搜索命令或别名"
        filterItem={filterItem}
        onOpenChange={setOpen}
        onQueryChange={setQuery}
        onSelect={(item) => setSelected(`已选择：${item.label}`)}
      />
    </div>
  )
}

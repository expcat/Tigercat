import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Spotlight } from '@expcat/tigercat-react/Spotlight'
import type { SpotlightItem } from '@expcat/tigercat-react'

const items: SpotlightItem[] = [
  {
    key: 'dashboard',
    label: '打开仪表盘',
    group: '导航',
    keywords: ['home'],
    shortcut: ['⌘', 'D']
  },
  { key: 'invite', label: '邀请成员', group: '操作', keywords: ['team'] }
]

export default function App() {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState('')

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">按 Ctrl/⌘ K 打开。页内按钮只是补充通道。</p>
      <Button onClick={() => setOpen(true)}>打开命令面板</Button>
      {selected && <p className="text-sm text-gray-500">已选择：{selected}</p>}
      <Spotlight
        open={open}
        items={items}
        onOpenChange={setOpen}
        onSelect={(item) => setSelected(item.label)}
      />
    </div>
  )
}

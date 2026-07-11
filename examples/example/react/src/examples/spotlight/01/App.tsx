import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Spotlight } from '@expcat/tigercat-react/Spotlight'
import type { SpotlightItem } from '@expcat/tigercat-react'

const items: SpotlightItem[] = [
  { key: 'dashboard', label: '打开仪表盘', group: '导航', keywords: ['home'] },
  { key: 'invite', label: '邀请成员', group: '操作', keywords: ['team'] }
]

export default function App() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState('')

  return (
    <div className="space-y-3">
      <Button onClick={() => setOpen(true)}>打开命令面板</Button>
      {selected && <p className="text-sm text-gray-500">已选择：{selected}</p>}
      <Spotlight
        open={open}
        query={query}
        items={items}
        title="命令面板"
        placeholder="搜索页面或操作"
        onOpenChange={setOpen}
        onQueryChange={setQuery}
        onSelect={(item) => setSelected(item.label)}
      />
    </div>
  )
}

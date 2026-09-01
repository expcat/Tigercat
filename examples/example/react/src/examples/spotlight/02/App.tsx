import { useState } from 'react'
import { Spotlight } from '@expcat/tigercat-react/Spotlight'
import type { SpotlightItem } from '@expcat/tigercat-core'

const items: SpotlightItem[] = [
  {
    key: 'settings',
    label: '打开偏好设置',
    description: '调整主题、语言和通知',
    group: '导航',
    shortcut: ['⌘', ','],
    keywords: ['config', '配置']
  },
  {
    key: 'invite',
    label: '邀请团队成员',
    description: '创建并复制邀请链接',
    group: '操作',
    shortcut: ['⌘', 'I'],
    keywords: ['member', 'team']
  },
  {
    key: 'billing',
    label: '管理账单',
    description: '当前账号没有账单管理权限',
    group: '操作',
    disabled: true,
    keywords: ['payment', 'invoice']
  }
]

export default function App() {
  const [selected, setSelected] = useState('尚未选择命令')

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500" aria-live="polite">
        {selected}。别名走 keywords；面板打开时 ⌘ , 会选中偏好设置。
      </p>
      <Spotlight items={items} onSelect={(item) => setSelected(`已选择：${item.label}`)} />
    </div>
  )
}

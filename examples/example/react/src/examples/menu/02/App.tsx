import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Menu } from '@expcat/tigercat-react/Menu'
import type { MenuItem as MenuItemData } from '@expcat/tigercat-core'

const items: MenuItemData[] = [
  { key: 'dashboard', label: '仪表盘' },
  {
    key: 'team',
    label: '团队',
    children: [
      { key: 'members', label: '成员' },
      { key: 'roles', label: '角色' }
    ]
  }
]

export default function App() {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={() => setCollapsed((value) => !value)}>
        {collapsed ? '展开菜单' : '收起菜单'}
      </Button>
      <Menu
        items={items}
        mode="inline"
        theme="dark"
        collapsed={collapsed}
        defaultSelectedKeys={['dashboard']}
      />
    </div>
  )
}

import { useState } from 'react'
import { Menu } from '@expcat/tigercat-react/Menu'
import type { MenuItem as MenuItemData } from '@expcat/tigercat-core'

const items: MenuItemData[] = [
  { key: 'home', label: '首页' },
  {
    key: 'products',
    label: '产品',
    children: [
      { key: 'components', label: '组件库' },
      { key: 'templates', label: '模板' }
    ]
  },
  { key: 'settings', label: '设置', disabled: true }
]

export default function App() {
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(['home'])
  const [openKeys, setOpenKeys] = useState<(string | number)[]>(['products'])

  return (
    <Menu
      items={items}
      mode="inline"
      searchable
      searchPlaceholder="搜索菜单"
      selectedKeys={selectedKeys}
      openKeys={openKeys}
      onSelectedKeysChange={setSelectedKeys}
      onOpenKeysChange={setOpenKeys}
    />
  )
}

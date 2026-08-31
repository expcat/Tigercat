import { useState } from 'react'
import { Menu } from '@expcat/tigercat-react/Menu'
import type { MenuItem as MenuItemData } from '@expcat/tigercat-core'

const items: MenuItemData[] = [
  { key: 'home', label: '首页', href: '#home' },
  {
    key: 'products',
    label: '产品',
    children: [
      { key: 'components', label: '组件库', href: '#components' },
      { key: 'templates', label: '模板', href: '#templates' }
    ]
  },
  { key: 'settings', label: '设置', disabled: true }
]

export default function App() {
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(['home'])

  return (
    <Menu
      items={items}
      defaultOpenKeys={['products']}
      selectedKeys={selectedKeys}
      onSelectedKeysChange={setSelectedKeys}
      aria-label="站点"
    />
  )
}

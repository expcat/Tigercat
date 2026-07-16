import { useState } from 'react'
import { Menu } from '@expcat/tigercat-react/Menu'
import { MenuItem } from '@expcat/tigercat-react/MenuItem'
import { MenuItemGroup } from '@expcat/tigercat-react/MenuItemGroup'
import { SubMenu } from '@expcat/tigercat-react/SubMenu'

export default function MenuChildrenExample() {
  const [selectedKeys, setSelectedKeys] = useState<Array<string | number>>(['overview'])
  const [openKeys, setOpenKeys] = useState<Array<string | number>>(['settings'])

  return (
    <div style={{ maxWidth: 320 }}>
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        openKeys={openKeys}
        onSelectedKeysChange={setSelectedKeys}
        onOpenKeysChange={setOpenKeys}>
        <MenuItem itemKey="overview">概览</MenuItem>
        <MenuItemGroup title="团队">
          <MenuItem itemKey="members">成员</MenuItem>
          <SubMenu itemKey="settings" title="设置">
            <MenuItem itemKey="profile">个人资料</MenuItem>
            <MenuItem itemKey="security">安全设置</MenuItem>
          </SubMenu>
        </MenuItemGroup>
      </Menu>
      <p role="status" style={{ margin: '12px 0 0' }}>
        当前选择：{selectedKeys.join(', ') || '无'}
      </p>
    </div>
  )
}

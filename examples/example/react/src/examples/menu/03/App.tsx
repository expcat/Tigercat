import { useState } from 'react'
import { Menu } from '@expcat/tigercat-react/Menu'
import { MenuItem } from '@expcat/tigercat-react/MenuItem'
import { SubMenu } from '@expcat/tigercat-react/SubMenu'

export default function App() {
  const [selectedKeys, setSelectedKeys] = useState<Array<string | number>>(['overview'])

  return (
    <Menu
      mode="horizontal"
      selectedKeys={selectedKeys}
      onSelectedKeysChange={setSelectedKeys}
      aria-label="顶栏">
      <MenuItem itemKey="overview" href="#overview">
        概览
      </MenuItem>
      <SubMenu itemKey="team" title="团队">
        <MenuItem itemKey="members">成员</MenuItem>
        <MenuItem itemKey="roles">角色</MenuItem>
      </SubMenu>
      <MenuItem itemKey="help">帮助</MenuItem>
    </Menu>
  )
}

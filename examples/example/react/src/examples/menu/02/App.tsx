import React, { useState } from 'react'
import { Menu } from '@expcat/tigercat-react/Menu'
import { MenuItem } from '@expcat/tigercat-react/MenuItem'
import { SubMenu } from '@expcat/tigercat-react/SubMenu'
import { MenuItemGroup } from '@expcat/tigercat-react/MenuItemGroup'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  const [selectedKeys1, setSelectedKeys1] = useState<(string | number)[]>(['1'])

  const [selectedKeys2, setSelectedKeys2] = useState<(string | number)[]>(['home'])

  const [selectedKeys3, setSelectedKeys3] = useState<(string | number)[]>(['1'])

  const [openKeys3, setOpenKeys3] = useState<(string | number)[]>(['sub1'])

  const [selectedKeys4, setSelectedKeys4] = useState<(string | number)[]>(['1'])

  const [openKeys4, setOpenKeys4] = useState<(string | number)[]>(['sub1'])

  const [collapsed, setCollapsed] = useState(false)

  const [selectedKeys5, setSelectedKeys5] = useState<(string | number)[]>(['1'])

  const [selectedKeys6, setSelectedKeys6] = useState<(string | number)[]>(['1'])

  const [selectedKeys7, setSelectedKeys7] = useState<(string | number)[]>(['1'])

  const [selectedKeys8, setSelectedKeys8] = useState<(string | number)[]>(['1'])

  const [openKeys8, setOpenKeys8] = useState<(string | number)[]>([])

  const homeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'

  const settingsIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.196-15.196l-4.243 4.243m-5.906 5.906l-4.243 4.243M23 12h-6m-6 0H1m15.196 5.196l-4.243-4.243m-5.906-5.906l-4.243-4.243"></path></svg>'

  const userIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">收起菜单</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="mb-4">
              <Button
                onClick={() => setCollapsed(!collapsed)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                {collapsed ? '展开' : '收起'}
              </Button>
            </div>
            <div className="bg-white inline-block">
              <Menu
                mode="vertical"
                collapsed={collapsed}
                selectedKeys={selectedKeys5}
                onSelectedKeysChange={setSelectedKeys5}>
                <MenuItem itemKey="1">菜单项 1</MenuItem>
                <MenuItem itemKey="2">菜单项 2</MenuItem>
                <SubMenu itemKey="sub1" title="子菜单">
                  <MenuItem itemKey="3">选项 3</MenuItem>
                  <MenuItem itemKey="4">选项 4</MenuItem>
                </SubMenu>
              </Menu>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">暗色主题</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="inline-block">
              <Menu
                theme="dark"
                selectedKeys={selectedKeys6}
                onSelectedKeysChange={setSelectedKeys6}>
                <MenuItem itemKey="1">菜单项 1</MenuItem>
                <MenuItem itemKey="2">菜单项 2</MenuItem>
                <SubMenu itemKey="sub1" title="子菜单">
                  <MenuItem itemKey="3">选项 3</MenuItem>
                  <MenuItem itemKey="4">选项 4</MenuItem>
                </SubMenu>
              </Menu>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">带图标的菜单</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-white inline-block">
              <Menu selectedKeys={selectedKeys7} onSelectedKeysChange={setSelectedKeys7}>
                <MenuItem itemKey="1" icon={homeIcon}>
                  首页
                </MenuItem>
                <MenuItem itemKey="2" icon={userIcon}>
                  用户
                </MenuItem>
                <SubMenu itemKey="sub1" title="设置" icon={settingsIcon}>
                  <MenuItem itemKey="3">常规设置</MenuItem>
                  <MenuItem itemKey="4">高级设置</MenuItem>
                </SubMenu>
              </Menu>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">菜单项分组</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-white inline-block">
              <Menu>
                <MenuItemGroup title="分组 1">
                  <MenuItem itemKey="1">选项 1</MenuItem>
                  <MenuItem itemKey="2">选项 2</MenuItem>
                </MenuItemGroup>
                <MenuItemGroup title="分组 2">
                  <MenuItem itemKey="3">选项 3</MenuItem>
                  <MenuItem itemKey="4">选项 4</MenuItem>
                </MenuItemGroup>
              </Menu>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">单一展开模式</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-white inline-block">
              <Menu
                multiple={false}
                selectedKeys={selectedKeys8}
                openKeys={openKeys8}
                onSelectedKeysChange={setSelectedKeys8}
                onOpenKeysChange={setOpenKeys8}>
                <SubMenu itemKey="sub1" title="导航 1">
                  <MenuItem itemKey="1">选项 1</MenuItem>
                  <MenuItem itemKey="2">选项 2</MenuItem>
                </SubMenu>
                <SubMenu itemKey="sub2" title="导航 2">
                  <MenuItem itemKey="3">选项 3</MenuItem>
                  <MenuItem itemKey="4">选项 4</MenuItem>
                </SubMenu>
                <SubMenu itemKey="sub3" title="导航 3">
                  <MenuItem itemKey="5">选项 5</MenuItem>
                  <MenuItem itemKey="6">选项 6</MenuItem>
                </SubMenu>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

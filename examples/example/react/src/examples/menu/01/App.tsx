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
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-white inline-block">
              <Menu selectedKeys={selectedKeys1} onSelectedKeysChange={setSelectedKeys1}>
                <MenuItem itemKey="1">菜单项 1</MenuItem>
                <MenuItem itemKey="2">菜单项 2</MenuItem>
                <MenuItem itemKey="3">菜单项 3</MenuItem>
                <MenuItem itemKey="4" disabled>
                  禁用菜单项
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">横向菜单</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-white">
              <Menu
                mode="horizontal"
                selectedKeys={selectedKeys2}
                onSelectedKeysChange={setSelectedKeys2}>
                <MenuItem itemKey="home">首页</MenuItem>
                <SubMenu itemKey="products" title="产品">
                  <MenuItem itemKey="product-a">产品 A</MenuItem>
                  <SubMenu itemKey="product-b" title="产品 B">
                    <MenuItem itemKey="product-b1">产品 B-1</MenuItem>
                    <MenuItem itemKey="product-b2">产品 B-2</MenuItem>
                  </SubMenu>
                </SubMenu>
                <MenuItem itemKey="about">关于</MenuItem>
                <MenuItem itemKey="contact">联系我们</MenuItem>
              </Menu>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">子菜单</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-white inline-block">
              <Menu
                selectedKeys={selectedKeys3}
                openKeys={openKeys3}
                onSelectedKeysChange={setSelectedKeys3}
                onOpenKeysChange={setOpenKeys3}>
                <SubMenu itemKey="sub1" title="导航 1">
                  <MenuItem itemKey="1">选项 1</MenuItem>
                  <MenuItem itemKey="2">选项 2</MenuItem>
                  <MenuItem itemKey="3">选项 3</MenuItem>
                </SubMenu>
                <SubMenu itemKey="sub2" title="导航 2">
                  <MenuItem itemKey="4">选项 4</MenuItem>
                  <MenuItem itemKey="5">选项 5</MenuItem>
                </SubMenu>
                <MenuItem itemKey="6">导航 3</MenuItem>
              </Menu>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">内联模式</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="bg-white inline-block">
              <Menu
                mode="inline"
                selectedKeys={selectedKeys4}
                openKeys={openKeys4}
                onSelectedKeysChange={setSelectedKeys4}
                onOpenKeysChange={setOpenKeys4}>
                <SubMenu itemKey="sub1" title="导航 1">
                  <MenuItem itemKey="1">选项 1</MenuItem>
                  <MenuItem itemKey="2">选项 2</MenuItem>
                </SubMenu>
                <SubMenu itemKey="sub2" title="导航 2">
                  <MenuItem itemKey="3">选项 3</MenuItem>
                  <MenuItem itemKey="4">选项 4</MenuItem>
                </SubMenu>
              </Menu>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

import React, { useState } from 'react'
import { Menu, MenuItem, SubMenu, MenuItemGroup, Button } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Menu selectedKeys={selectedKeys1} onSelect={(key) => setSelectedKeys1([key])}>
  <MenuItem itemKey="1">菜单项 1</MenuItem>
  <MenuItem itemKey="2">菜单项 2</MenuItem>
  <MenuItem itemKey="3">菜单项 3</MenuItem>
  <MenuItem itemKey="4" disabled>禁用菜单项</MenuItem>
</Menu>`

const horizontalSnippet = `<Menu mode="horizontal" selectedKeys={selectedKeys2} onSelect={(key) => setSelectedKeys2([key])}>
  <MenuItem itemKey="home">首页</MenuItem>
  <MenuItem itemKey="products">产品</MenuItem>
  <MenuItem itemKey="about">关于</MenuItem>
  <MenuItem itemKey="contact">联系我们</MenuItem>
</Menu>`

const subMenuSnippet = `<Menu
  selectedKeys={selectedKeys3}
  openKeys={openKeys3}
  onSelect={(key) => setSelectedKeys3([key])}
  onOpenChange={(_key, { openKeys }) => setOpenKeys3(openKeys)}>
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
</Menu>`

const inlineSnippet = `<Menu
  mode="inline"
  selectedKeys={selectedKeys4}
  openKeys={openKeys4}
  onSelect={(key) => setSelectedKeys4([key])}
  onOpenChange={(_key, { openKeys }) => setOpenKeys4(openKeys)}>
  <SubMenu itemKey="sub1" title="导航 1">
    <MenuItem itemKey="1">选项 1</MenuItem>
    <MenuItem itemKey="2">选项 2</MenuItem>
  </SubMenu>
  <SubMenu itemKey="sub2" title="导航 2">
    <MenuItem itemKey="3">选项 3</MenuItem>
    <MenuItem itemKey="4">选项 4</MenuItem>
  </SubMenu>
</Menu>`

const collapseSnippet = `<Button
  onClick={() => setCollapsed(!collapsed)}
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  {collapsed ? '展开' : '收起'}
</Button>
<Menu
  mode="vertical"
  collapsed={collapsed}
  selectedKeys={selectedKeys5}
  onSelect={(key) => setSelectedKeys5([key])}>
  <MenuItem itemKey="1">菜单项 1</MenuItem>
  <MenuItem itemKey="2">菜单项 2</MenuItem>
  <SubMenu itemKey="sub1" title="子菜单">
    <MenuItem itemKey="3">选项 3</MenuItem>
    <MenuItem itemKey="4">选项 4</MenuItem>
  </SubMenu>
</Menu>`

const darkSnippet = `<Menu theme="dark" selectedKeys={selectedKeys6} onSelect={(key) => setSelectedKeys6([key])}>
  <MenuItem itemKey="1">菜单项 1</MenuItem>
  <MenuItem itemKey="2">菜单项 2</MenuItem>
  <SubMenu itemKey="sub1" title="子菜单">
    <MenuItem itemKey="3">选项 3</MenuItem>
    <MenuItem itemKey="4">选项 4</MenuItem>
  </SubMenu>
</Menu>`

const iconSnippet = `<Menu selectedKeys={selectedKeys7} onSelect={(key) => setSelectedKeys7([key])}>
  <MenuItem itemKey="1" icon={homeIcon}>首页</MenuItem>
  <MenuItem itemKey="2" icon={userIcon}>用户</MenuItem>
  <SubMenu itemKey="sub1" title="设置" icon={settingsIcon}>
    <MenuItem itemKey="3">常规设置</MenuItem>
    <MenuItem itemKey="4">高级设置</MenuItem>
  </SubMenu>
</Menu>`

const groupSnippet = `<Menu>
  <MenuItemGroup title="分组 1">
    <MenuItem itemKey="1">选项 1</MenuItem>
    <MenuItem itemKey="2">选项 2</MenuItem>
  </MenuItemGroup>
  <MenuItemGroup title="分组 2">
    <MenuItem itemKey="3">选项 3</MenuItem>
    <MenuItem itemKey="4">选项 4</MenuItem>
  </MenuItemGroup>
</Menu>`

const MenuDemo: React.FC = () => {
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

  const homeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>'
  const settingsIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v6m0 6v6m5.196-15.196l-4.243 4.243m-5.906 5.906l-4.243 4.243M23 12h-6m-6 0H1m15.196 5.196l-4.243-4.243m-5.906-5.906l-4.243-4.243"></path></svg>'
  const userIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>'

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Menu 菜单</h1>
        <p className="text-gray-600">为页面和功能提供导航的菜单列表。</p>
      </div>

      {/* 基本用法 */}
      <DemoBlock title="基本用法" description="垂直菜单，默认模式。" code={basicSnippet}>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="bg-white inline-block">
            <Menu selectedKeys={selectedKeys1} onSelect={(key) => setSelectedKeys1([key])}>
              <MenuItem itemKey="1">菜单项 1</MenuItem>
              <MenuItem itemKey="2">菜单项 2</MenuItem>
              <MenuItem itemKey="3">菜单项 3</MenuItem>
              <MenuItem itemKey="4" disabled>
                禁用菜单项
              </MenuItem>
            </Menu>
          </div>
        </div>
      </DemoBlock>

      {/* 横向菜单 */}
      <DemoBlock title="横向菜单" description="水平导航菜单。" code={horizontalSnippet}>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="bg-white">
            <Menu
              mode="horizontal"
              selectedKeys={selectedKeys2}
              onSelect={(key) => setSelectedKeys2([key])}>
              <MenuItem itemKey="home">首页</MenuItem>
              <MenuItem itemKey="products">产品</MenuItem>
              <MenuItem itemKey="about">关于</MenuItem>
              <MenuItem itemKey="contact">联系我们</MenuItem>
            </Menu>
          </div>
        </div>
      </DemoBlock>

      {/* 子菜单 */}
      <DemoBlock title="子菜单" description="多级菜单结构。" code={subMenuSnippet}>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="bg-white inline-block">
            <Menu
              selectedKeys={selectedKeys3}
              openKeys={openKeys3}
              onSelect={(key) => setSelectedKeys3([key])}
              onOpenChange={(_key, { openKeys }) => setOpenKeys3(openKeys)}>
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
      </DemoBlock>

      {/* 内联模式 */}
      <DemoBlock title="内联模式" description="垂直菜单，子菜单内嵌在菜单中。" code={inlineSnippet}>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="bg-white inline-block">
            <Menu
              mode="inline"
              selectedKeys={selectedKeys4}
              openKeys={openKeys4}
              onSelect={(key) => setSelectedKeys4([key])}
              onOpenChange={(_key, { openKeys }) => setOpenKeys4(openKeys)}>
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
      </DemoBlock>

      {/* 收起菜单 */}
      <DemoBlock title="收起菜单" description="可以收起的垂直菜单。" code={collapseSnippet}>
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
              onSelect={(key) => setSelectedKeys5([key])}>
              <MenuItem itemKey="1">菜单项 1</MenuItem>
              <MenuItem itemKey="2">菜单项 2</MenuItem>
              <SubMenu itemKey="sub1" title="子菜单">
                <MenuItem itemKey="3">选项 3</MenuItem>
                <MenuItem itemKey="4">选项 4</MenuItem>
              </SubMenu>
            </Menu>
          </div>
        </div>
      </DemoBlock>

      {/* 暗色主题 */}
      <DemoBlock title="暗色主题" description="使用暗色主题的菜单。" code={darkSnippet}>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="inline-block">
            <Menu
              theme="dark"
              selectedKeys={selectedKeys6}
              onSelect={(key) => setSelectedKeys6([key])}>
              <MenuItem itemKey="1">菜单项 1</MenuItem>
              <MenuItem itemKey="2">菜单项 2</MenuItem>
              <SubMenu itemKey="sub1" title="子菜单">
                <MenuItem itemKey="3">选项 3</MenuItem>
                <MenuItem itemKey="4">选项 4</MenuItem>
              </SubMenu>
            </Menu>
          </div>
        </div>
      </DemoBlock>

      {/* 带图标的菜单 */}
      <DemoBlock title="带图标的菜单" description="菜单项可以添加图标。" code={iconSnippet}>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="bg-white inline-block">
            <Menu selectedKeys={selectedKeys7} onSelect={(key) => setSelectedKeys7([key])}>
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
      </DemoBlock>

      {/* 菜单项分组 */}
      <DemoBlock
        title="菜单项分组"
        description="使用 MenuItemGroup 对菜单项进行分组。"
        code={groupSnippet}>
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
      </DemoBlock>
    </div>
  )
}

export default MenuDemo

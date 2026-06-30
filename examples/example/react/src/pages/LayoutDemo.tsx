import React, { useState } from 'react'
import { Container } from '@expcat/tigercat-react/Container'
import { Layout } from '@expcat/tigercat-react/Layout'
import { Header } from '@expcat/tigercat-react/Header'
import { Sidebar } from '@expcat/tigercat-react/Sidebar'
import { Content } from '@expcat/tigercat-react/Content'
import { Footer } from '@expcat/tigercat-react/Footer'
import { Menu } from '@expcat/tigercat-react/Menu'
import { MenuItem } from '@expcat/tigercat-react/MenuItem'
import { SubMenu } from '@expcat/tigercat-react/SubMenu'
import DemoBlock from '../components/DemoBlock'
import fullPageSnippet from './LayoutDemo.tsx?raw'

const containerSnippet = `<Container maxWidth="lg">
  <div>这里是 Container 内容区域</div>
</Container>`

const basicSnippet = `<Layout>
  <Header>Header</Header>
  <Content>Content</Content>
  <Footer>Footer</Footer>
</Layout>`

const heightSnippet = `<Layout>
  <Header height="48px">Header (48px)</Header>
  <Content>Content</Content>
  <Footer height="64px">Footer (64px)</Footer>
</Layout>`

const sidebarSnippet = `<Layout>
  <Header>Header</Header>
  <div className="flex flex-1">
    <Sidebar width="192px">Sidebar</Sidebar>
    <Content>Content</Content>
  </div>
  <Footer>Footer</Footer>
</Layout>`

const collapsedSnippet = `const [collapsed, setCollapsed] = useState(false)

<Layout>
  <Header>Header</Header>
  <div className="flex flex-1">
    <Sidebar width="192px" collapsedWidth="64px" collapsed={collapsed}>Sidebar</Sidebar>
    <Content>Content</Content>
  </div>
  <Footer>Footer</Footer>
</Layout>`

const miniSnippet = `<Layout>
  <Header>Header</Header>
  <div className="flex flex-1">
    <Sidebar width="192px" collapsedWidth="48px" collapsed={mini}>
      {mini ? <div className="text-center">☰</div> : <div>Full Sidebar</div>}
    </Sidebar>
    <Content>Content</Content>
  </div>
</Layout>`

const shellSidebarSnippet = `const [collapsed, setCollapsed] = useState(false)
const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>(['dashboard'])
const [openKeys, setOpenKeys] = useState<(string | number)[]>(['system'])

<Sidebar width="240px" collapsedWidth="64px" collapsed={collapsed}>
  <div className="flex h-full flex-col">
    <div className="flex items-center gap-3 px-4 py-4">
      <span className="grid size-8 place-items-center rounded-lg bg-[var(--tiger-primary,#2563eb)] text-white">T</span>
      <span className={collapsed ? 'max-w-0 opacity-0 -translate-x-2' : 'max-w-32 opacity-100 translate-x-0'}>
        Tigercat Admin
      </span>
    </div>
    <div className="flex-1 px-2 py-3">
      <Menu
        mode="inline"
        collapsed={collapsed}
        popupPortal
        selectedKeys={selectedKeys}
        openKeys={collapsed ? [] : openKeys}
        onSelectedKeysChange={setSelectedKeys}
        onOpenKeysChange={setOpenKeys}>
        <MenuItem itemKey="dashboard" icon={<span className="text-xs">⌂</span>}>Dashboard</MenuItem>
        <SubMenu itemKey="system" title="System" icon={<span className="text-xs">⚙</span>}>
          <MenuItem itemKey="users">Users</MenuItem>
          <MenuItem itemKey="roles">Roles</MenuItem>
        </SubMenu>
      </Menu>
    </div>
    <button onClick={() => setCollapsed((value) => !value)}>
      <span>{collapsed ? '>' : '<'}</span>
      <span className={collapsed ? 'max-w-0 opacity-0 translate-x-2' : 'max-w-32 opacity-100 translate-x-0'}>
        {collapsed ? '展开侧栏' : '收起侧栏'}
      </span>
    </button>
  </div>
</Sidebar>`

const collapsedScriptSnippet = `const [collapsed, setCollapsed] = useState(false)`

const complexSnippet = `<Layout>
  <Header>Header</Header>
  <div className="flex flex-1">
    <Sidebar width="192px">Sidebar</Sidebar>
    <Layout>
      <Content>Content</Content>
      <Footer>Inner Footer</Footer>
    </Layout>
  </div>
  <Footer>Footer</Footer>
</Layout>`

const LayoutDemo: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [miniCollapsed, setMiniCollapsed] = useState(true)
  const [shellCollapsed, setShellCollapsed] = useState(false)
  const [shellSelectedKeys, setShellSelectedKeys] = useState<(string | number)[]>(['dashboard'])
  const [shellOpenKeys, setShellOpenKeys] = useState<(string | number)[]>(['system'])
  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Layout 布局</h1>
        <p className="text-gray-600 dark:text-gray-400">协助进行页面级整体布局。</p>
      </div>

      <DemoBlock
        title="Container 容器"
        description="用于约束内容宽度并提供响应式内边距。"
        code={fullPageSnippet}>
        <div className="bg-gray-50 rounded-lg py-6">
          <Container maxWidth="lg">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="font-medium mb-1">这里是 Container 内容区域</div>
              <div className="text-sm text-gray-600">
                maxWidth=&quot;lg&quot;，默认居中并带有响应式 padding
              </div>
            </div>
          </Container>
        </div>
      </DemoBlock>

      <DemoBlock title="基础布局" description="典型的页面布局。" code={fullPageSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Layout className="border border-gray-300 overflow-hidden min-h-[260px]">
            <Header className="!bg-blue-600 !text-white !p-4">Header</Header>
            <Content className="!bg-white !p-4">Content</Content>
            <Footer className="!bg-gray-800 !text-white !p-4">Footer</Footer>
          </Layout>
        </div>
      </DemoBlock>

      <DemoBlock
        title="自定义高度"
        description="自定义 Header 和 Footer 的高度。"
        code={fullPageSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Layout className="border border-gray-300 overflow-hidden min-h-[260px]">
            <Header height="48px" className="!bg-blue-600 !text-white !p-4">
              Header (48px)
            </Header>
            <Content className="!bg-white !p-4">Content</Content>
            <Footer height="64px" className="!bg-gray-800 !text-white !p-4">
              Footer (64px)
            </Footer>
          </Layout>
        </div>
      </DemoBlock>

      <DemoBlock title="侧边栏布局" description="带有侧边栏的布局。" code={fullPageSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Layout className="border border-gray-300 overflow-hidden min-h-[260px]">
            <Header className="!bg-blue-600 !text-white !p-4">Header</Header>
            <div className="flex flex-1">
              <Sidebar width="192px" className="!bg-gray-200 !p-4">
                Sidebar
              </Sidebar>
              <Content className="!bg-white !p-4">Content</Content>
            </div>
            <Footer className="!bg-gray-800 !text-white !p-4">Footer</Footer>
          </Layout>
        </div>
      </DemoBlock>

      <DemoBlock
        title="Sidebar 折叠"
        description="可折叠的侧边栏，通过 collapsedWidth 设置折叠后的宽度（默认 64px）。"
        code={fullPageSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <button
            className="mb-4 px-3 py-1 rounded bg-blue-500 text-white text-sm"
            onClick={() => setCollapsed((c) => !c)}>
            {collapsed ? '展开侧边栏' : '折叠侧边栏'}
          </button>
          <Layout className="border border-gray-300 overflow-hidden min-h-[260px]">
            <Header className="!bg-blue-600 !text-white !p-4">Header</Header>
            <div className="flex flex-1">
              <Sidebar
                width="192px"
                collapsedWidth="64px"
                collapsed={collapsed}
                className="!bg-gray-200 !p-4">
                Sidebar
              </Sidebar>
              <Content className="!bg-white !p-4">Content</Content>
            </div>
            <Footer className="!bg-gray-800 !text-white !p-4">Footer</Footer>
          </Layout>
        </div>
      </DemoBlock>

      <DemoBlock
        title="后台 Shell 侧栏"
        description="推荐使用 Sidebar 的 collapsedWidth 配合文案 max-width、opacity、transform transition；Menu 在 inline + collapsed + popupPortal 下会自动退化成折叠侧栏常见的 popup 子菜单，无需手动切成 vertical。"
        code={fullPageSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Layout className="border border-gray-300 overflow-hidden min-h-[320px]">
            <Sidebar
              width="240px"
              collapsedWidth="64px"
              collapsed={shellCollapsed}
              className="!bg-white !p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-[var(--tiger-border,#e5e7eb)] px-4 py-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--tiger-primary,#2563eb)] text-sm font-semibold text-white">
                    T
                  </span>
                  <span
                    className={[
                      'overflow-hidden whitespace-nowrap text-sm font-semibold text-[var(--tiger-text,#111827)] transition-[max-width,opacity,transform] duration-300',
                      shellCollapsed
                        ? 'max-w-0 -translate-x-2 opacity-0'
                        : 'max-w-32 translate-x-0 opacity-100'
                    ].join(' ')}>
                    Tigercat Admin
                  </span>
                </div>
                <div className="flex-1 px-2 py-3">
                  <Menu
                    mode="inline"
                    collapsed={shellCollapsed}
                    popupPortal
                    selectedKeys={shellSelectedKeys}
                    openKeys={shellCollapsed ? [] : shellOpenKeys}
                    onSelectedKeysChange={setShellSelectedKeys}
                    onOpenKeysChange={setShellOpenKeys}>
                    <MenuItem
                      itemKey="dashboard"
                      icon={
                        <span className="inline-flex size-4 items-center justify-center text-[11px]">
                          ⌂
                        </span>
                      }>
                      Dashboard
                    </MenuItem>
                    <SubMenu
                      itemKey="system"
                      title="System"
                      icon={
                        <span className="inline-flex size-4 items-center justify-center text-[11px]">
                          ⚙
                        </span>
                      }>
                      <MenuItem itemKey="users">Users</MenuItem>
                      <MenuItem itemKey="roles">Roles</MenuItem>
                    </SubMenu>
                  </Menu>
                </div>
                <button
                  type="button"
                  className="m-3 flex items-center justify-center gap-2 rounded-lg border border-[var(--tiger-border,#e5e7eb)] px-2 py-2 text-sm text-[var(--tiger-text,#111827)] transition-colors hover:bg-[var(--tiger-surface-muted,#f9fafb)]"
                  onClick={() => setShellCollapsed((value) => !value)}>
                  <span className="shrink-0">{shellCollapsed ? '>' : '<'}</span>
                  <span
                    className={[
                      'overflow-hidden whitespace-nowrap transition-[max-width,opacity,transform] duration-300',
                      shellCollapsed
                        ? 'max-w-0 translate-x-2 opacity-0'
                        : 'max-w-32 translate-x-0 opacity-100'
                    ].join(' ')}>
                    {shellCollapsed ? '展开侧栏' : '收起侧栏'}
                  </span>
                </button>
              </div>
            </Sidebar>
            <Content className="!bg-white !p-6">
              <div className="rounded-xl border border-dashed border-[var(--tiger-border,#e5e7eb)] p-6 text-sm text-[var(--tiger-text-muted,#6b7280)]">
                Shell 内容区域
              </div>
            </Content>
          </Layout>
        </div>
      </DemoBlock>

      <DemoBlock
        title="Mini 模式侧边栏"
        description="collapsedWidth 设为更小的值（如 48px）实现 mini 模式，折叠时仅显示图标。"
        code={fullPageSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <button
            className="mb-4 px-3 py-1 rounded bg-blue-500 text-white text-sm"
            onClick={() => setMiniCollapsed((c) => !c)}>
            {miniCollapsed ? '展开' : '折叠为 Mini'}
          </button>
          <Layout className="border border-gray-300 overflow-hidden min-h-[260px]">
            <Header className="!bg-blue-600 !text-white !p-4">Header</Header>
            <div className="flex flex-1">
              <Sidebar
                width="192px"
                collapsedWidth="48px"
                collapsed={miniCollapsed}
                className="!bg-gray-200 !p-4">
                {miniCollapsed ? (
                  <div className="text-center text-xl">☰</div>
                ) : (
                  <div>
                    <div className="font-medium mb-2">导航菜单</div>
                    <div className="text-sm text-gray-600">菜单项 1</div>
                    <div className="text-sm text-gray-600">菜单项 2</div>
                    <div className="text-sm text-gray-600">菜单项 3</div>
                  </div>
                )}
              </Sidebar>
              <Content className="!bg-white !p-4">Content</Content>
            </div>
          </Layout>
        </div>
      </DemoBlock>

      <DemoBlock title="复杂布局" description="更复杂的页面布局。" code={fullPageSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Layout className="border border-gray-300 overflow-hidden min-h-[400px]">
            <Header className="!bg-blue-600 !text-white !p-4">Header</Header>
            <div className="flex flex-1">
              <Sidebar width="192px" className="!bg-gray-200 !p-4">
                Sidebar
              </Sidebar>
              <Layout className="min-h-0 flex-1">
                <Content className="!bg-white !p-4">Content</Content>
                <Footer className="!bg-gray-100 !p-4">Inner Footer</Footer>
              </Layout>
            </div>
            <Footer className="!bg-gray-800 !text-white !p-4">Footer</Footer>
          </Layout>
        </div>
      </DemoBlock>
    </div>
  )
}

export default LayoutDemo

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

export default function App() {
  const [collapsed, setCollapsed] = useState(false)

  const [miniCollapsed, setMiniCollapsed] = useState(true)

  const [shellCollapsed, setShellCollapsed] = useState(false)

  const [shellSelectedKeys, setShellSelectedKeys] = useState<(string | number)[]>(['dashboard'])

  const [shellOpenKeys, setShellOpenKeys] = useState<(string | number)[]>(['system'])

  return (
    <>
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
    </>
  )
}

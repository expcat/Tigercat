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
    </>
  )
}

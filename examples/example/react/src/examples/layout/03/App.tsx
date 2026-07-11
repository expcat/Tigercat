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
    </>
  )
}

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
    </>
  )
}

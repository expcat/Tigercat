import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Layout } from '@expcat/tigercat-react/Layout'
import { Header } from '@expcat/tigercat-react/Header'
import { Sidebar } from '@expcat/tigercat-react/Sidebar'
import { Content } from '@expcat/tigercat-react/Content'

export default function App() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="space-y-3">
      <Button size="sm" onClick={() => setCollapsed((value) => !value)}>
        {collapsed ? '展开侧栏' : '折叠侧栏'}
      </Button>
      <Layout className="min-h-64 overflow-hidden rounded border border-gray-300">
        <Header className="!bg-blue-600 !p-4 !text-white">后台管理</Header>
        <div className="flex flex-1">
          <Sidebar width="192px" collapsedWidth="64px" collapsed={collapsed}>
            导航
          </Sidebar>
          <Content className="!p-4">工作区</Content>
        </div>
      </Layout>
    </div>
  )
}

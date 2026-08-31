import { useState } from 'react'
import { Button } from '@expcat/tigercat-react/Button'
import { Layout } from '@expcat/tigercat-react/Layout'
import { Header } from '@expcat/tigercat-react/Header'
import { Sidebar } from '@expcat/tigercat-react/Sidebar'
import { Content } from '@expcat/tigercat-react/Content'
import { Menu } from '@expcat/tigercat-react/Menu'

const items = [
  { key: 'home', label: '首页' },
  { key: 'settings', label: '设置' }
]

export default function App() {
  const [collapsed, setCollapsed] = useState(false)
  const [hidden, setHidden] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button size="sm" onClick={() => setCollapsed((value) => !value)}>
          {collapsed ? '展开迷你侧栏' : '折叠为迷你侧栏'}
        </Button>
        <Button size="sm" onClick={() => setHidden((value) => !value)}>
          {hidden ? '显示侧栏' : '折叠到 0'}
        </Button>
      </div>
      <Layout className="h-64 overflow-hidden rounded border border-[var(--tiger-border)]">
        <Header>后台管理</Header>
        <Layout>
          <Sidebar
            width="192px"
            collapsedWidth={hidden ? '0px' : '64px'}
            collapsed={collapsed || hidden}>
            <Menu items={items} />
          </Sidebar>
          <Content as="div">工作区。侧栏是 Layout 直子，不必再包一层 flex。</Content>
        </Layout>
      </Layout>
    </div>
  )
}

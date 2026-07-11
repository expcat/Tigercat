import { useState } from 'react'
import { Tabs } from '@expcat/tigercat-react/Tabs'
import { TabPane } from '@expcat/tigercat-react/TabPane'

export default function App() {
  const [activeKey, setActiveKey] = useState('overview')

  return (
    <Tabs
      activeKey={activeKey}
      onActiveKeyChange={(key) => setActiveKey(String(key))}
      type="card"
      size="large">
      <TabPane tabKey="overview" label="概览">
        <div className="p-4">项目概览内容</div>
      </TabPane>
      <TabPane tabKey="activity" label="动态">
        <div className="p-4">最近动态内容</div>
      </TabPane>
    </Tabs>
  )
}

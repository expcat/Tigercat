import { Tabs } from '@expcat/tigercat-react/Tabs'
import { TabPane } from '@expcat/tigercat-react/TabPane'

export default function App() {
  return (
    <Tabs defaultActiveKey={1}>
      <TabPane tabKey={1} label="概览">
        <div className="p-4">默认线型。defaultActiveKey 与 tabKey 都是数字 1。</div>
      </TabPane>
      <TabPane tabKey="2" label="动态">
        <div className="p-4">最近动态内容</div>
      </TabPane>
    </Tabs>
  )
}

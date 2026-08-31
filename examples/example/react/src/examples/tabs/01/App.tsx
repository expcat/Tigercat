import { Tabs } from '@expcat/tigercat-react/Tabs'
import { TabPane } from '@expcat/tigercat-react/TabPane'

export default function App() {
  return (
    <Tabs defaultActiveKey="1">
      <TabPane tabKey={1} label="概览">
        <div className="p-4">默认线型。tabKey 是数字 1，activeKey 字符串也能对上。</div>
      </TabPane>
      <TabPane tabKey="2" label="动态">
        <div className="p-4">最近动态内容</div>
      </TabPane>
    </Tabs>
  )
}

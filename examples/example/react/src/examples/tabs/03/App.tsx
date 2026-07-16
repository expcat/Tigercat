import { Tabs } from '@expcat/tigercat-react/Tabs'
import { TabPane } from '@expcat/tigercat-react/TabPane'

const types = ['line', 'pills', 'card'] as const

export default function App() {
  return (
    <div className="space-y-6">
      {types.map((type) => (
        <Tabs key={type} defaultActiveKey="a" type={type}>
          <TabPane tabKey="a" label="首页">
            <div className="p-3 text-sm text-gray-600">type=&quot;{type}&quot; 的首页面板</div>
          </TabPane>
          <TabPane tabKey="b" label="消息">
            <div className="p-3 text-sm text-gray-600">消息面板</div>
          </TabPane>
          <TabPane tabKey="c" label="设置">
            <div className="p-3 text-sm text-gray-600">设置面板</div>
          </TabPane>
        </Tabs>
      ))}
    </div>
  )
}

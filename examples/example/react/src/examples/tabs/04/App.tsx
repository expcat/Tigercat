import { Tabs } from '@expcat/tigercat-react/Tabs'
import { TabPane } from '@expcat/tigercat-react/TabPane'

export default function App() {
  return (
    <div className="space-y-6">
      <Tabs defaultActiveKey="a" tabPosition="left" type="line">
        <TabPane tabKey="a" label="基础信息">
          <div className="p-3 text-sm text-gray-600">tabPosition=&quot;left&quot; 时标签栏在左侧。</div>
        </TabPane>
        <TabPane tabKey="b" label="安全设置">
          <div className="p-3 text-sm text-gray-600">安全设置面板。</div>
        </TabPane>
        <TabPane tabKey="c" label="已停用" disabled>
          <div className="p-3 text-sm text-gray-600">该面板已禁用。</div>
        </TabPane>
      </Tabs>
      <Tabs defaultActiveKey="a" size="small" centered type="pills">
        <TabPane tabKey="a" label="全部">
          <div className="p-2 text-sm text-gray-600">size=small · centered</div>
        </TabPane>
        <TabPane tabKey="b" label="进行中">
          <div className="p-2 text-sm text-gray-600">进行中</div>
        </TabPane>
        <TabPane tabKey="c" label="已完成">
          <div className="p-2 text-sm text-gray-600">已完成</div>
        </TabPane>
      </Tabs>
    </div>
  )
}

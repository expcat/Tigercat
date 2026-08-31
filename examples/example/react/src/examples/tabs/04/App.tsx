import { Tabs } from '@expcat/tigercat-react/Tabs'
import { TabPane } from '@expcat/tigercat-react/TabPane'

export default function App() {
  return (
    <div className="space-y-6">
      <Tabs tabPosition="left" type="line">
        <TabPane tabKey="a" label="基础信息" disabled>
          <div className="p-3 text-sm text-gray-600">第一项禁用时默认落到下一个启用项。</div>
        </TabPane>
        <TabPane tabKey="b" label="安全设置">
          <div className="p-3 text-sm text-gray-600">安全设置面板。</div>
        </TabPane>
        <TabPane tabKey="c" label="通知">
          <div className="p-3 text-sm text-gray-600">通知面板。</div>
        </TabPane>
      </Tabs>
      <Tabs tabPosition="bottom" lazy>
        <TabPane tabKey="a" label="概览">
          <div className="p-3 text-sm text-gray-600">
            默认 swipeable 关闭，面板横滑不会切 tab。lazy 未激活面板不进 DOM。
          </div>
        </TabPane>
        <TabPane tabKey="b" label="日志">
          <div className="p-3 text-sm text-gray-600">日志面板。</div>
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

import { Collapse } from '@expcat/tigercat-react/Collapse'
import { CollapsePanel } from '@expcat/tigercat-react/CollapsePanel'

export default function App() {
  return (
    <Collapse defaultActiveKey={['profile']}>
      <CollapsePanel
        panelKey="profile"
        header={<strong className="text-blue-600">用户资料</strong>}
        extra={<span className="text-xs text-gray-500">已更新</span>}>
        自定义标题和额外区域可承载状态信息。
      </CollapsePanel>
    </Collapse>
  )
}

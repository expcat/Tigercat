import { useState } from 'react'
import { Collapse } from '@expcat/tigercat-react/Collapse'
import { CollapsePanel } from '@expcat/tigercat-react/CollapsePanel'

export default function App() {
  const [activeKey, setActiveKey] = useState<(string | number)[]>(['faq-1'])

  return (
    <div className="space-y-6">
      <Collapse accordion activeKey={activeKey} onChange={setActiveKey}>
        <CollapsePanel panelKey="faq-1" header="如何安装？">
          使用包管理器安装对应的 React 包。
        </CollapsePanel>
        <CollapsePanel panelKey="faq-2" header="是否支持暗色主题？">
          支持，并可通过 ConfigProvider 统一配置。
        </CollapsePanel>
      </Collapse>
      <Collapse defaultActiveKey={['a', 'b']}>
        <CollapsePanel panelKey="a" header="可以同时打开">
          非手风琴模式下多块面板能一起展开。
        </CollapsePanel>
        <CollapsePanel panelKey="b" header="另一块也开着">
          关闭手风琴后，点开不会收起其它面板。
        </CollapsePanel>
      </Collapse>
    </div>
  )
}

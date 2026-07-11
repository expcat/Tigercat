import { useState } from 'react'
import { Collapse } from '@expcat/tigercat-react/Collapse'
import { CollapsePanel } from '@expcat/tigercat-react/CollapsePanel'

export default function App() {
  const [activeKey, setActiveKey] = useState<string | number | undefined>('faq-1')

  return (
    <Collapse accordion activeKey={activeKey} onChange={(value) => setActiveKey(value as string)}>
      <CollapsePanel panelKey="faq-1" header="如何安装？">
        使用包管理器安装对应的 React 包。
      </CollapsePanel>
      <CollapsePanel panelKey="faq-2" header="是否支持暗色主题？">
        支持，并可通过 ConfigProvider 统一配置。
      </CollapsePanel>
    </Collapse>
  )
}

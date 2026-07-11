import { Collapse } from '@expcat/tigercat-react/Collapse'
import { CollapsePanel } from '@expcat/tigercat-react/CollapsePanel'

export default function App() {
  return (
    <Collapse defaultActiveKey={['outer']}>
      <CollapsePanel panelKey="outer" header="外层面板">
        <Collapse defaultActiveKey={['inner']}>
          <CollapsePanel panelKey="inner" header="嵌套面板">
            嵌套内容拥有独立的展开状态。
          </CollapsePanel>
        </Collapse>
      </CollapsePanel>
    </Collapse>
  )
}

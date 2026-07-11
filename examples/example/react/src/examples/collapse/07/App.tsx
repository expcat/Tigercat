import { CollapsePanel } from '@expcat/tigercat-react/CollapsePanel'
import { useState } from 'react'
import { Collapse } from '@expcat/tigercat-react/Collapse'

export default function App() {
  const [activeKey1, setActiveKey1] = useState<string[]>(['1'])

  const [activeKey2, setActiveKey2] = useState<string | undefined>('1')

  const [activeKey3, setActiveKey3] = useState<string[]>([])

  const [activeKey4, setActiveKey4] = useState<string[]>([])

  const [activeKey5, setActiveKey5] = useState<string[]>([])

  const [activeKey6, setActiveKey6] = useState<string[]>([])

  const [activeKey7, setActiveKey7] = useState<string[]>(['1'])

  const [activeKey8, setActiveKey8] = useState<string[]>([])

  const [activeKey9, setActiveKey9] = useState<string[]>([])

  const toStringArray = (value: string | number | (string | number)[] | undefined) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item))
    }

    if (value === undefined) {
      return []
    }

    return [String(value)]
  }

  const toStringValue = (value: string | number | (string | number)[] | undefined) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? String(value[0]) : undefined
    }

    if (value === undefined) {
      return undefined
    }

    return String(value)
  }

  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <Collapse activeKey={activeKey7} onChange={(value) => setActiveKey7(toStringArray(value))}>
          <CollapsePanel panelKey="1" header="外层面板 1">
            <Collapse>
              <CollapsePanel panelKey="1-1" header="嵌套面板 1-1">
                <p>这是嵌套的内容。</p>
              </CollapsePanel>
              <CollapsePanel panelKey="1-2" header="嵌套面板 1-2">
                <p>嵌套面板可以有自己独立的状态。</p>
              </CollapsePanel>
            </Collapse>
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="外层面板 2">
            <p>普通面板内容。</p>
          </CollapsePanel>
        </Collapse>
      </div>
    </>
  )
}

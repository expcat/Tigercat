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
        <Collapse activeKey={activeKey1} onChange={(value) => setActiveKey1(toStringArray(value))}>
          <CollapsePanel panelKey="1" header="面板标题 1">
            <p>这是面板 1 的内容。可以包含任意 HTML 元素。</p>
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="面板标题 2">
            <p>这是面板 2 的内容。折叠面板适合用于展示大量信息。</p>
          </CollapsePanel>
          <CollapsePanel panelKey="3" header="面板标题 3">
            <p>这是面板 3 的内容。每个面板可以独立展开或折叠。</p>
          </CollapsePanel>
        </Collapse>
      </div>
    </>
  )
}

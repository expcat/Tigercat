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
        <Collapse
          accordion
          activeKey={activeKey2}
          onChange={(value) => setActiveKey2(toStringValue(value))}>
          <CollapsePanel panelKey="1" header="手风琴面板 1">
            <p>手风琴模式下，展开一个面板会自动收起其他面板。</p>
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="手风琴面板 2">
            <p>适合用于 FAQ 或者步骤指南等场景。</p>
          </CollapsePanel>
          <CollapsePanel panelKey="3" header="手风琴面板 3">
            <p>点击其他面板时，当前面板会自动收起。</p>
          </CollapsePanel>
        </Collapse>
      </div>
    </>
  )
}

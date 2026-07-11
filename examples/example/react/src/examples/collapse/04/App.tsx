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
      <div className="p-6 bg-linear-to-r from-blue-50 to-purple-50 rounded-lg">
        <Collapse
          ghost
          activeKey={activeKey4}
          onChange={(value) => setActiveKey4(toStringArray(value))}>
          <CollapsePanel panelKey="1" header="Ghost 面板 1">
            <p>Ghost 模式的面板没有背景色，适合放在有背景的容器中。</p>
          </CollapsePanel>
          <CollapsePanel panelKey="2" header="Ghost 面板 2">
            <p>可以更好地融入页面设计。</p>
          </CollapsePanel>
        </Collapse>
      </div>
    </>
  )
}

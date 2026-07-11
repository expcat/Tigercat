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
        <Collapse activeKey={activeKey8} onChange={(value) => setActiveKey8(toStringArray(value))}>
          <CollapsePanel
            panelKey="1"
            header={<span className="font-bold text-blue-600">🎨 自定义标题</span>}
            extra={<span className="text-xs text-gray-400">额外内容</span>}>
            <p>使用 ReactNode 可以完全自定义面板标题和右侧额外内容。</p>
          </CollapsePanel>
          <CollapsePanel
            panelKey="2"
            header={<span className="font-bold text-green-600">📝 另一个自定义标题</span>}>
            <p>每个面板都可以有不同的自定义标题样式。</p>
          </CollapsePanel>
        </Collapse>
      </div>
    </>
  )
}

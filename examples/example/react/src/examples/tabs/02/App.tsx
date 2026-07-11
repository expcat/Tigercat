import { useRef, useState } from 'react'
import { Tabs } from '@expcat/tigercat-react/Tabs'
import { TabPane } from '@expcat/tigercat-react/TabPane'

interface TabData {
  key: string
  label: string
}

export default function App() {
  const [tabs, setTabs] = useState<TabData[]>([
    { key: '1', label: '标签 1' },
    { key: '2', label: '标签 2' }
  ])
  const [activeKey, setActiveKey] = useState('1')
  const nextKey = useRef(3)

  const handleEdit = (info: { targetKey?: string | number; action: 'add' | 'remove' }) => {
    if (info.action === 'add') {
      const key = String(nextKey.current++)
      setTabs((current) => [...current, { key, label: '标签 ' + key }])
      setActiveKey(key)
      return
    }

    const key = String(info.targetKey)
    setTabs((current) => current.filter((tab) => tab.key !== key))
    if (activeKey === key) setActiveKey(tabs.find((tab) => tab.key !== key)?.key ?? '')
  }

  return (
    <Tabs
      activeKey={activeKey}
      onActiveKeyChange={(key) => setActiveKey(String(key))}
      type="editable-card"
      closable
      onEdit={handleEdit}>
      {tabs.map((tab) => (
        <TabPane key={tab.key} tabKey={tab.key} label={tab.label}>
          <div className="p-4">{tab.label} 的内容</div>
        </TabPane>
      ))}
    </Tabs>
  )
}

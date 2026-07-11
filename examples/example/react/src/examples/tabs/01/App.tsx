import { TabPane } from '@expcat/tigercat-react/TabPane'
import { useRef, useState } from 'react'
import { Tabs } from '@expcat/tigercat-react/Tabs'

export default function App() {
  const [activeKey1, setActiveKey1] = useState('1')

  const [activeKey2, setActiveKey2] = useState('1')

  const [activeKey3, setActiveKey3] = useState('1')

  const [activeKey4, setActiveKey4] = useState('1')

  const [activeKey5, setActiveKey5] = useState('1')

  const [activeKey6, setActiveKey6] = useState('1')

  const [activeKey7, setActiveKey7] = useState('1')

  const [activeKey8, setActiveKey8] = useState('1')

  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')

  // Editable tabs
  const [editableTabs, setEditableTabs] = useState([
    { key: '1', label: '标签 1', content: '标签 1 的内容' },
    { key: '2', label: '标签 2', content: '标签 2 的内容' },
    { key: '3', label: '标签 3', content: '标签 3 的内容' }
  ])

  const [activeEditableKey, setActiveEditableKey] = useState('1')

  const newTabIndexRef = useRef(4)

  const handleEdit = ({
    targetKey,
    action
  }: {
    targetKey?: string | number
    action: 'add' | 'remove'
  }) => {
    if (action === 'add') {
      const newKey = `${newTabIndexRef.current++}`
      setEditableTabs([
        ...editableTabs,
        {
          key: newKey,
          label: `新标签 ${newKey}`,
          content: `新标签 ${newKey} 的内容`
        }
      ])
      setActiveEditableKey(newKey)
    } else if (action === 'remove') {
      const targetKeyString = String(targetKey)
      const newTabs = editableTabs.filter((tab) => tab.key !== targetKeyString)
      setEditableTabs(newTabs)

      // 如果删除的是当前激活的标签，激活下一个标签
      if (activeEditableKey === targetKeyString && newTabs.length > 0) {
        const index = editableTabs.findIndex((tab) => tab.key === targetKeyString)
        setActiveEditableKey(newTabs[index] ? newTabs[index].key : newTabs[0].key)
      }
    }
  }

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Tabs activeKey={activeKey1} onActiveKeyChange={(key) => setActiveKey1(String(key))}>
              <TabPane tabKey="1" label="标签页 1">
                <div className="p-4">标签页 1 的内容</div>
              </TabPane>
              <TabPane tabKey="2" label="标签页 2">
                <div className="p-4">标签页 2 的内容</div>
              </TabPane>
              <TabPane tabKey="3" label="标签页 3">
                <div className="p-4">标签页 3 的内容</div>
              </TabPane>
            </Tabs>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">卡片式标签页</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Tabs
              activeKey={activeKey2}
              onActiveKeyChange={(key) => setActiveKey2(String(key))}
              type="card">
              <TabPane tabKey="1" label="选项卡 1">
                <div className="p-4">选项卡 1 的内容</div>
              </TabPane>
              <TabPane tabKey="2" label="选项卡 2">
                <div className="p-4">选项卡 2 的内容</div>
              </TabPane>
              <TabPane tabKey="3" label="选项卡 3">
                <div className="p-4">选项卡 3 的内容</div>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

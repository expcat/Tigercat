import { useRef, useState } from 'react'
import { Tabs, TabPane } from '@expcat/tigercat-react'
import DemoBlock from '../components/DemoBlock'

const basicSnippet = `<Tabs activeKey={activeKey1} onChange={...}>
  <TabPane tabKey="1" label="标签页 1">...</TabPane>
</Tabs>`

const cardSnippet = `<Tabs type="card">...</Tabs>`

const editableSnippet = `<Tabs type="editable-card" closable onEdit={handleEdit}>...</Tabs>`

const positionSnippet = `<Tabs tabPosition={position}>...</Tabs>`

const centeredSnippet = `<Tabs centered>...</Tabs>`

const sizeSnippet = `<Tabs size="small">...</Tabs>
<Tabs size="medium">...</Tabs>
<Tabs size="large">...</Tabs>`

const disabledSnippet = `<TabPane tabKey="2" label="禁用标签" disabled>...</TabPane>`

const iconSnippet = `<TabPane tabKey="1" label="首页" icon={<span>🏠</span>}>...</TabPane>`

const destroySnippet = `<Tabs destroyInactiveTabPane>...</Tabs>`

export default function TabsDemo() {
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
    <div className="max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tabs 标签页</h1>
        <p className="text-gray-600">用于内容的分类与切换。</p>
      </div>

      <DemoBlock title="基本用法" description="基础的、简洁的标签页。" code={basicSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs activeKey={activeKey1} onChange={(key) => setActiveKey1(String(key))}>
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
      </DemoBlock>

      <DemoBlock
        title="卡片式标签页"
        description="卡片式的标签页，适合在容器内使用。"
        code={cardSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs activeKey={activeKey2} onChange={(key) => setActiveKey2(String(key))} type="card">
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
      </DemoBlock>

      <DemoBlock title="可编辑卡片" description="可以新增和关闭标签页。" code={editableSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs
            activeKey={activeEditableKey}
            onChange={(key) => setActiveEditableKey(String(key))}
            type="editable-card"
            closable
            onEdit={handleEdit}>
            {editableTabs.map((tab) => (
              <TabPane key={tab.key} tabKey={tab.key} label={tab.label}>
                <div className="p-4">{tab.content}</div>
              </TabPane>
            ))}
          </Tabs>
        </div>
      </DemoBlock>

      <DemoBlock
        title="不同位置"
        description="可以设置标签页的位置：上、下、左、右。"
        code={positionSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <label className="mr-4">位置：</label>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as 'top' | 'bottom' | 'left' | 'right')}
              className="border border-gray-300 rounded px-3 py-2">
              <option value="top">上</option>
              <option value="bottom">下</option>
              <option value="left">左</option>
              <option value="right">右</option>
            </select>
          </div>
          <Tabs
            activeKey={activeKey3}
            onChange={(key) => setActiveKey3(String(key))}
            tabPosition={position}>
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
      </DemoBlock>

      <DemoBlock title="居中标签" description="标签居中显示。" code={centeredSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs activeKey={activeKey4} onChange={(key) => setActiveKey4(String(key))} centered>
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
      </DemoBlock>

      <DemoBlock
        title="不同尺寸"
        description="提供三种尺寸：小、中（默认）、大。"
        code={sizeSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">小尺寸</h3>
            <Tabs
              activeKey={activeKey5}
              onChange={(key) => setActiveKey5(String(key))}
              size="small">
              <TabPane tabKey="1" label="小尺寸 1">
                <div className="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="2" label="小尺寸 2">
                <div className="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="3" label="小尺寸 3">
                <div className="p-4">内容</div>
              </TabPane>
            </Tabs>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">中等尺寸（默认）</h3>
            <Tabs
              activeKey={activeKey5}
              onChange={(key) => setActiveKey5(String(key))}
              size="medium">
              <TabPane tabKey="1" label="中等尺寸 1">
                <div className="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="2" label="中等尺寸 2">
                <div className="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="3" label="中等尺寸 3">
                <div className="p-4">内容</div>
              </TabPane>
            </Tabs>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">大尺寸</h3>
            <Tabs
              activeKey={activeKey5}
              onChange={(key) => setActiveKey5(String(key))}
              size="large">
              <TabPane tabKey="1" label="大尺寸 1">
                <div className="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="2" label="大尺寸 2">
                <div className="p-4">内容</div>
              </TabPane>
              <TabPane tabKey="3" label="大尺寸 3">
                <div className="p-4">内容</div>
              </TabPane>
            </Tabs>
          </div>
        </div>
      </DemoBlock>

      <DemoBlock title="禁用标签" description="可以禁用某个标签页。" code={disabledSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs activeKey={activeKey6} onChange={(key) => setActiveKey6(String(key))}>
            <TabPane tabKey="1" label="标签页 1">
              <div className="p-4">标签页 1 的内容</div>
            </TabPane>
            <TabPane tabKey="2" label="禁用标签" disabled>
              <div className="p-4">标签页 2 的内容（不可访问）</div>
            </TabPane>
            <TabPane tabKey="3" label="标签页 3">
              <div className="p-4">标签页 3 的内容</div>
            </TabPane>
          </Tabs>
        </div>
      </DemoBlock>

      <DemoBlock title="带图标的标签" description="标签可以配置图标。" code={iconSnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs activeKey={activeKey7} onChange={(key) => setActiveKey7(String(key))}>
            <TabPane tabKey="1" label="首页" icon={<span>🏠</span>}>
              <div className="p-4">首页内容</div>
            </TabPane>
            <TabPane tabKey="2" label="用户" icon={<span>👤</span>}>
              <div className="p-4">用户内容</div>
            </TabPane>
            <TabPane tabKey="3" label="设置" icon={<span>⚙️</span>}>
              <div className="p-4">设置内容</div>
            </TabPane>
          </Tabs>
        </div>
      </DemoBlock>

      <DemoBlock
        title="销毁非激活面板"
        description="切换时销毁已隐藏的标签面板，而非仅隐藏。"
        code={destroySnippet}>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs
            activeKey={activeKey8}
            onChange={(key) => setActiveKey8(String(key))}
            destroyInactiveTabPane>
            <TabPane tabKey="1" label="标签页 1">
              <div className="p-4">标签页 1 — 切换后此内容被销毁</div>
            </TabPane>
            <TabPane tabKey="2" label="标签页 2">
              <div className="p-4">标签页 2 — 切换后此内容被销毁</div>
            </TabPane>
            <TabPane tabKey="3" label="标签页 3">
              <div className="p-4">标签页 3 — 切换后此内容被销毁</div>
            </TabPane>
          </Tabs>
        </div>
      </DemoBlock>
    </div>
  )
}

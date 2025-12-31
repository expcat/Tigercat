import { useState } from 'react'
import { Tabs, TabPane } from '@tigercat/react'

export default function TabsDemo() {
  const [activeKey1, setActiveKey1] = useState('1')
  const [activeKey2, setActiveKey2] = useState('1')
  const [activeKey3, setActiveKey3] = useState('1')
  const [activeKey4, setActiveKey4] = useState('1')
  const [activeKey5, setActiveKey5] = useState('1')
  const [activeKey6, setActiveKey6] = useState('1')
  const [position, setPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')

  // Editable tabs
  const [editableTabs, setEditableTabs] = useState([
    { key: '1', label: '标签 1', content: '标签 1 的内容' },
    { key: '2', label: '标签 2', content: '标签 2 的内容' },
    { key: '3', label: '标签 3', content: '标签 3 的内容' },
  ])
  const [activeEditableKey, setActiveEditableKey] = useState('1')
  let newTabIndex = 4

  const handleEdit = ({ targetKey, action }: { targetKey: string | number; action: 'add' | 'remove' }) => {
    if (action === 'add') {
      const newKey = `${newTabIndex++}`
      setEditableTabs([...editableTabs, {
        key: newKey,
        label: `新标签 ${newKey}`,
        content: `新标签 ${newKey} 的内容`,
      }])
      setActiveEditableKey(newKey)
    } else if (action === 'remove') {
      const newTabs = editableTabs.filter(tab => tab.key !== targetKey)
      setEditableTabs(newTabs)
      
      // 如果删除的是当前激活的标签，激活下一个标签
      if (activeEditableKey === targetKey && newTabs.length > 0) {
        const index = editableTabs.findIndex(tab => tab.key === targetKey)
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

      {/* 基本用法 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">基本用法</h2>
        <p className="text-gray-600 mb-6">基础的、简洁的标签页。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs activeKey={activeKey1} onChange={setActiveKey1}>
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
        <hr className="my-6 border-gray-200" />
      </section>

      {/* 卡片式标签页 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">卡片式标签页</h2>
        <p className="text-gray-600 mb-6">卡片式的标签页，适合在容器内使用。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs activeKey={activeKey2} onChange={setActiveKey2} type="card">
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
        <hr className="my-6 border-gray-200" />
      </section>

      {/* 可编辑卡片 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">可编辑卡片</h2>
        <p className="text-gray-600 mb-6">可以新增和关闭标签页。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs 
            activeKey={activeEditableKey} 
            onChange={setActiveEditableKey}
            type="editable-card"
            closable
            onEdit={handleEdit}
          >
            {editableTabs.map(tab => (
              <TabPane key={tab.key} tabKey={tab.key} label={tab.label}>
                <div className="p-4">{tab.content}</div>
              </TabPane>
            ))}
          </Tabs>
        </div>
        <hr className="my-6 border-gray-200" />
      </section>

      {/* 不同位置 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同位置</h2>
        <p className="text-gray-600 mb-6">可以设置标签页的位置：上、下、左、右。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <label className="mr-4">位置：</label>
            <select 
              value={position} 
              onChange={(e) => setPosition(e.target.value as 'top' | 'bottom' | 'left' | 'right')}
              className="border border-gray-300 rounded px-3 py-2"
            >
              <option value="top">上</option>
              <option value="bottom">下</option>
              <option value="left">左</option>
              <option value="right">右</option>
            </select>
          </div>
          <Tabs activeKey={activeKey3} onChange={setActiveKey3} tabPosition={position}>
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
        <hr className="my-6 border-gray-200" />
      </section>

      {/* 居中标签 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">居中标签</h2>
        <p className="text-gray-600 mb-6">标签居中显示。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs activeKey={activeKey4} onChange={setActiveKey4} centered>
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
        <hr className="my-6 border-gray-200" />
      </section>

      {/* 不同尺寸 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">不同尺寸</h2>
        <p className="text-gray-600 mb-6">提供三种尺寸：小、中（默认）、大。</p>
        <div className="p-6 bg-gray-50 rounded-lg space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">小尺寸</h3>
            <Tabs activeKey={activeKey5} onChange={setActiveKey5} size="small">
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
            <Tabs activeKey={activeKey5} onChange={setActiveKey5} size="medium">
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
            <Tabs activeKey={activeKey5} onChange={setActiveKey5} size="large">
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
        <hr className="my-6 border-gray-200" />
      </section>

      {/* 禁用标签 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">禁用标签</h2>
        <p className="text-gray-600 mb-6">可以禁用某个标签页。</p>
        <div className="p-6 bg-gray-50 rounded-lg">
          <Tabs activeKey={activeKey6} onChange={setActiveKey6}>
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
      </section>
    </div>
  )
}

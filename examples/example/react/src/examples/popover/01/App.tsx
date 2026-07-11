import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { List } from '@expcat/tigercat-react/List'
import { useState } from 'react'
import { Popover } from '@expcat/tigercat-react/Popover'

export default function App() {
  const [visible1, setVisible1] = useState(false)

  const [manualVisible, setManualVisible] = useState(false)

  const customContentItems = ['列表项 1', '列表项 2', '列表项 3']

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基本用法</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Popover content="这是一个气泡卡片的内容">
              <Button>触发气泡卡片</Button>
            </Popover>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">带标题</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Popover title="气泡卡片标题" content="这是一个带标题的气泡卡片内容">
              <Button>带标题的气泡卡片</Button>
            </Popover>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义内容</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Popover
              titleContent={<span style={{ color: '#2563eb' }}>自定义标题</span>}
              contentContent={
                <div>
                  <p className="mb-2">这是自定义的内容</p>
                  <List
                    className="text-sm"
                    bordered="none"
                    split={false}
                    size="sm"
                    dataSource={customContentItems.map((title, index) => ({
                      key: index,
                      title
                    }))}
                    renderItem={(item) => (
                      <div className="flex items-start gap-2">
                        <span aria-hidden>•</span>
                        <span>{item.title}</span>
                      </div>
                    )}
                  />
                </div>
              }>
              <Button>自定义内容</Button>
            </Popover>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">不同位置</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <Popover title="提示" content="上方弹出" placement="top">
                <Button>上方</Button>
              </Popover>

              <Popover title="提示" content="下方弹出" placement="bottom">
                <Button>下方</Button>
              </Popover>

              <Popover title="提示" content="左侧弹出" placement="left">
                <Button>左侧</Button>
              </Popover>

              <Popover title="提示" content="右侧弹出" placement="right">
                <Button>右侧</Button>
              </Popover>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">触发方式</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Space>
              <Popover title="点击触发" content="点击按钮触发" trigger="click">
                <Button>点击触发</Button>
              </Popover>

              <Popover title="悬停触发" content="悬停触发气泡卡片" trigger="hover">
                <Button>悬停触发</Button>
              </Popover>

              <Popover title="聚焦触发" content="聚焦触发气泡卡片" trigger="focus">
                <Button>聚焦触发</Button>
              </Popover>

              <Popover
                open={manualVisible}
                onOpenChange={setManualVisible}
                title="手动触发"
                content="手动控制显示隐藏"
                trigger="manual">
                <Button onClick={() => setManualVisible(!manualVisible)}>手动触发</Button>
              </Popover>
            </Space>
          </div>
        </div>
      </div>
    </>
  )
}

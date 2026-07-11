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
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">自定义宽度</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Space>
              <Popover title="自定义宽度" content="这是一个宽度为 300px 的气泡卡片" width="300">
                <Button>宽度 300px</Button>
              </Popover>

              <Popover title="自定义宽度" content="这是一个宽度为 400px 的气泡卡片" width="400">
                <Button>宽度 400px</Button>
              </Popover>
            </Space>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用状态</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Popover title="禁用状态" content="这个气泡卡片已被禁用" disabled>
              <Button disabled>禁用的气泡卡片</Button>
            </Popover>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">偏移距离</h3>
          <div className="p-6 bg-gray-50 rounded-lg">
            <Space size={16}>
              <Popover title="默认偏移" content="默认 8px 偏移">
                <Button>默认</Button>
              </Popover>

              <Popover title="自定义偏移" content="16px 偏移距离" offset={16}>
                <Button>offset=16</Button>
              </Popover>
            </Space>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            自动翻转 (Floating UI)
          </h3>
          <div className="p-6 bg-gray-100 rounded overflow-auto h-32">
            <div className="pt-16">
              <Popover placement="top" title="自动翻转" content="空间不足时自动翻转到下方">
                <Button>试试滚动容器</Button>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

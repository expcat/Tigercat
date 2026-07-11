import { Button } from '@expcat/tigercat-react/Button'
import { Space } from '@expcat/tigercat-react/Space'
import { useState } from 'react'
import { Tooltip } from '@expcat/tigercat-react/Tooltip'

export default function App() {
  const [visible1, setVisible1] = useState(false)

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用状态</h3>
          <Space size={16}>
            <Tooltip content="正常提示">
              <Button>正常</Button>
            </Tooltip>

            <Tooltip content="禁用提示" disabled>
              <Button>禁用</Button>
            </Tooltip>
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">偏移距离</h3>
          <Space size={16}>
            <Tooltip content="默认偏移 (8px)">
              <Button>默认</Button>
            </Tooltip>

            <Tooltip content="偏移 16px" offset={16}>
              <Button>offset=16</Button>
            </Tooltip>

            <Tooltip content="偏移 24px" offset={24}>
              <Button>offset=24</Button>
            </Tooltip>
          </Space>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            自动翻转 (Floating UI)
          </h3>
          <div className="p-4 bg-gray-100 rounded overflow-auto h-32">
            <div className="pt-16">
              <Tooltip content="空间不足时自动翻转" placement="top">
                <Button>试试滚动容器</Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

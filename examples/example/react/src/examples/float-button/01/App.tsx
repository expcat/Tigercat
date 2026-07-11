import { useState } from 'react'
import { FloatButton } from '@expcat/tigercat-react/FloatButton'
import { FloatButtonGroup } from '@expcat/tigercat-react/FloatButtonGroup'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未点击悬浮按钮')

  return (
    <>
      <div className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <div className="relative h-64 border rounded-lg overflow-hidden">
            <FloatButton
              tooltip="默认"
              style={{ position: 'absolute', right: 24, bottom: 24 }}
              onClick={() => setLastAction('点击了默认悬浮按钮')}
            />
            <FloatButton
              shape="square"
              type="default"
              tooltip="方形"
              style={{ position: 'absolute', right: 24, bottom: 80 }}
            />
            <FloatButton
              size="lg"
              tooltip="大号"
              style={{ position: 'absolute', right: 24, bottom: 136 }}
            />
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">按钮组</h3>
          <div className="relative h-64 border rounded-lg overflow-hidden">
            <FloatButtonGroup
              trigger="hover"
              triggerNode={<FloatButton tooltip="菜单" />}
              style={{ position: 'absolute', right: 24, bottom: 24 }}>
              <FloatButton
                tooltip="操作 A"
                type="default"
                onClick={() => setLastAction('选择了操作 A')}
              />
              <FloatButton
                tooltip="操作 B"
                type="default"
                onClick={() => setLastAction('选择了操作 B')}
              />
            </FloatButtonGroup>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">禁用</h3>
          <div className="relative h-40 border rounded-lg overflow-hidden">
            <FloatButton
              disabled
              tooltip="不可用"
              style={{ position: 'absolute', right: 24, bottom: 24 }}
            />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300" role="status">
          操作反馈：{lastAction}
        </p>
      </div>
    </>
  )
}

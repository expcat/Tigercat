import { useState } from 'react'
import { ContextMenu } from '@expcat/tigercat-react/ContextMenu'
import { ContextMenuItem } from '@expcat/tigercat-react/ContextMenuItem'
import { ContextMenuMenu } from '@expcat/tigercat-react/ContextMenuMenu'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未选择')

  return (
    <div className="space-y-3">
      <ContextMenu>
        <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
          在此区域右键
        </div>
        <ContextMenuMenu>
          <ContextMenuItem onClick={() => setLastAction('复制')}>复制</ContextMenuItem>
          <ContextMenuItem onClick={() => setLastAction('粘贴')}>粘贴</ContextMenuItem>
          <ContextMenuItem disabled>不可用</ContextMenuItem>
          <ContextMenuItem divided onClick={() => setLastAction('删除')}>
            删除
          </ContextMenuItem>
        </ContextMenuMenu>
      </ContextMenu>
      <p className="text-sm text-gray-500">最近操作：{lastAction}</p>
    </div>
  )
}

import { useState } from 'react'
import { ContextMenu } from '@expcat/tigercat-react/ContextMenu'
import { ContextMenuItem } from '@expcat/tigercat-react/ContextMenuItem'
import { ContextMenuMenu } from '@expcat/tigercat-react/ContextMenuMenu'
import { ContextMenuSub } from '@expcat/tigercat-react/ContextMenuSub'

export default function App() {
  const [lastAction, setLastAction] = useState('尚未选择')

  return (
    <div className="space-y-3">
      <ContextMenu>
        <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-600">
          右键打开带有子菜单的面板
        </div>
        <ContextMenuMenu>
          <ContextMenuItem onClick={() => setLastAction('刷新')}>刷新</ContextMenuItem>
          <ContextMenuSub title="分享到">
            <ContextMenuItem onClick={() => setLastAction('邮件')}>邮件</ContextMenuItem>
            <ContextMenuItem onClick={() => setLastAction('链接')}>链接</ContextMenuItem>
          </ContextMenuSub>
          <ContextMenuItem divided onClick={() => setLastAction('下载')}>
            下载
          </ContextMenuItem>
        </ContextMenuMenu>
      </ContextMenu>
      <p className="text-sm text-gray-500">最近操作：{lastAction}</p>
    </div>
  )
}

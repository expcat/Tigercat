import { Divider } from '@expcat/tigercat-react/Divider'
import { Space } from '@expcat/tigercat-react/Space'

export default function App() {
  return (
    <div className="space-y-4">
      <Space size="sm">
        <span>首页</span>
        <Divider orientation="vertical" spacing="none" />
        <span>文档</span>
        <Divider orientation="vertical" spacing="none" />
        <span>关于</span>
      </Space>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">color + thickness</p>
        <Divider color="#7c3aed" thickness="3px" spacing="sm" />
      </div>
    </div>
  )
}

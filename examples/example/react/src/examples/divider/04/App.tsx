import { Divider } from '@expcat/tigercat-react/Divider'

export default function App() {
  return (
    <div className="space-y-4">
      <div className="flex h-8 items-center gap-3 text-sm">
        <span>首页</span>
        <Divider orientation="vertical" className="h-4" />
        <span>文档</span>
        <Divider orientation="vertical" className="h-4" />
        <span>关于</span>
      </div>
      <div>
        <p className="text-sm text-gray-500">color + thickness</p>
        <Divider color="#7c3aed" thickness="3px" spacing="sm" />
      </div>
    </div>
  )
}

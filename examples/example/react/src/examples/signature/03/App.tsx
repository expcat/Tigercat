import { Signature } from '@expcat/tigercat-react/Signature'

export default function App() {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="space-y-1">
        <Signature width={280} height={140} readonly ariaLabel="只读画板" />
        <p className="text-xs text-gray-500">readonly：可展示不可绘制</p>
      </div>
      <div className="space-y-1">
        <Signature width={280} height={140} disabled clearable={false} ariaLabel="禁用画板" />
        <p className="text-xs text-gray-500">disabled + 隐藏清除按钮</p>
      </div>
    </div>
  )
}

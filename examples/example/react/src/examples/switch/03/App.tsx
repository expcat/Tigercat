import { Switch } from '@expcat/tigercat-react/Switch'

export default function App() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Switch checked disabled aria-label="禁用且开启" />
        <span className="text-sm text-gray-500">开 · disabled</span>
      </div>
      <div className="flex items-center gap-2">
        <Switch checked={false} disabled aria-label="禁用且关闭" />
        <span className="text-sm text-gray-500">关 · disabled</span>
      </div>
    </div>
  )
}

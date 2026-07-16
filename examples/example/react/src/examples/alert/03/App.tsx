import { Alert } from '@expcat/tigercat-react/Alert'

const types = ['success', 'info', 'warning', 'error'] as const

export default function App() {
  return (
    <div className="space-y-3">
      {types.map((type) => (
        <Alert key={type} type={type} title={`类型：${type}`} description="类型决定图标与配色。" showIcon />
      ))}
      <Alert type="info" title="无图标" description="showIcon=false 时不显示类型图标。" showIcon={false} />
    </div>
  )
}

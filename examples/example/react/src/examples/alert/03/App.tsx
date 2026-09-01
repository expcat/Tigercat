import { Alert } from '@expcat/tigercat-react/Alert'
import { Button } from '@expcat/tigercat-react/Button'

const types = ['success', 'info', 'warning', 'error'] as const

export default function App() {
  return (
    <div className="space-y-3">
      {types.map((type) => (
        <Alert
          key={type}
          type={type}
          title={`类型：${type}`}
          description="类型决定图标与配色。只有 error 默认是 live region。"
          showIcon
        />
      ))}
      <Alert
        type="info"
        title="无图标"
        description="showIcon=false 时不留图标间距。"
        showIcon={false}
      />
      <Alert type="success" title="标题加操作">
        <Button size="sm">撤销</Button>
      </Alert>
    </div>
  )
}

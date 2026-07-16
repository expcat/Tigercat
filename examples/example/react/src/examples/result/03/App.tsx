import { Button } from '@expcat/tigercat-react/Button'
import { Result } from '@expcat/tigercat-react/Result'

export default function App() {
  return (
    <Result
      status="success"
      title="部署完成"
      subTitle="服务已上线，可在控制台查看运行状态"
      icon={<span className="text-5xl">🚀</span>}
      extra={
        <div className="flex justify-center gap-2">
          <Button variant="primary">前往控制台</Button>
          <Button variant="outline">查看日志</Button>
        </div>
      }>
      <p className="text-center text-sm text-gray-500">children 可放置补充说明或详情列表。</p>
    </Result>
  )
}

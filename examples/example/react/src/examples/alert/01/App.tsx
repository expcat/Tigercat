import { Alert } from '@expcat/tigercat-react/Alert'

export default function App() {
  return (
    <Alert
      type="warning"
      size="lg"
      title="发布前请检查配置"
      description="这一实例同时演示代表类型、尺寸、图标与描述信息。"
      showIcon
    />
  )
}

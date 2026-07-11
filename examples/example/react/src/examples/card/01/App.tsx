import { Card } from '@expcat/tigercat-react/Card'

export default function App() {
  return (
    <Card
      variant="shadow"
      size="md"
      hoverable
      header={<h3 className="font-semibold">项目概览</h3>}
      footer={<span className="text-sm text-gray-500">更新于刚刚</span>}>
      <p className="text-gray-600">一个实例组合展示阴影、尺寸、悬停、头部与底部。</p>
    </Card>
  )
}

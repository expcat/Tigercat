import { Card } from '@expcat/tigercat-react/Card'

export default function App() {
  return (
    <Card
      variant="shadow"
      size="md"
      hoverable
      onClick={() => undefined}
      aria-label="项目概览"
      header={<h3 className="font-semibold">项目概览</h3>}
      footer={<span className="text-sm text-gray-500 dark:text-gray-400">更新于刚刚</span>}>
      <p className="text-gray-600 dark:text-gray-300">
        悬停抬起且可 Tab 进入。封面和 actions 见后面的示例。
      </p>
    </Card>
  )
}

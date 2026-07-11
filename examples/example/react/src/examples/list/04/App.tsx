import { Card } from '@expcat/tigercat-react/Card'
import { List } from '@expcat/tigercat-react/List'

const items = [
  { key: 1, title: '卡片一', content: '网格内容' },
  { key: 2, title: '卡片二', content: '网格内容' },
  { key: 3, title: '卡片三', content: '网格内容' }
]

export default function App() {
  return (
    <List
      dataSource={items}
      bordered="none"
      grid={{ gutter: 16, column: 3, xs: 1, sm: 2, md: 3 }}
      renderItem={(item) => (
        <Card variant="shadow">
          <h3 className="font-semibold">{String(item.title)}</h3>
          <p className="text-sm text-gray-500">{String(item.content)}</p>
        </Card>
      )}
    />
  )
}

import { List } from '@expcat/tigercat-react/List'

const items = [
  { key: 1, title: '需求评审', description: '今天 10:00' },
  { key: 2, title: '接口联调', description: '今天 14:00' },
  { key: 3, title: '发布检查', description: '明天 09:00' }
]

export default function App() {
  return <List dataSource={items} size="md" bordered="divided" hoverable />
}

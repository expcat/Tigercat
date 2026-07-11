import { Card } from '@expcat/tigercat-react/Card'
import { Space } from '@expcat/tigercat-react/Space'
import { Button } from '@expcat/tigercat-react/Button'
import { Pagination } from '@expcat/tigercat-react/Pagination'
import { useState } from 'react'
import { List } from '@expcat/tigercat-react/List'
import { type ListProps } from '@expcat/tigercat-react'

type DemoItem = NonNullable<ListProps['dataSource']>[number]

const basicData: DemoItem[] = [
  { key: 1, title: '列表项 1', description: '这是第一个列表项的描述' },
  { key: 2, title: '列表项 2', description: '这是第二个列表项的描述' },
  { key: 3, title: '列表项 3', description: '这是第三个列表项的描述' }
]

const userData: DemoItem[] = [
  {
    key: 1,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
    title: '张三',
    description: '软件工程师 · 北京'
  },
  {
    key: 2,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
    title: '李四',
    description: '产品经理 · 上海'
  },
  {
    key: 3,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
    title: '王五',
    description: 'UI 设计师 · 深圳'
  }
]

const largeData: DemoItem[] = Array.from({ length: 25 }, (_, i) => ({
  key: i + 1,
  title: `列表项 ${i + 1}`,
  description: `这是第 ${i + 1} 个列表项的描述信息`
}))

const gridData: DemoItem[] = [
  { key: 1, title: '卡片 1', content: '这是卡片内容 1' },
  { key: 2, title: '卡片 2', content: '这是卡片内容 2' },
  { key: 3, title: '卡片 3', content: '这是卡片内容 3' },
  { key: 4, title: '卡片 4', content: '这是卡片内容 4' },
  { key: 5, title: '卡片 5', content: '这是卡片内容 5' },
  { key: 6, title: '卡片 6', content: '这是卡片内容 6' }
]

const extraData: DemoItem[] = [
  {
    key: 1,
    title: '任务 1',
    description: '完成项目文档',
    extra: <Button size="sm">查看</Button>
  },
  {
    key: 2,
    title: '任务 2',
    description: 'Review Pull Requests',
    extra: <Button size="sm">查看</Button>
  }
]

const productData: DemoItem[] = [
  { key: 1, name: 'Product A', price: '¥99', stock: 15 },
  { key: 2, name: 'Product B', price: '¥149', stock: 8 },
  { key: 3, name: 'Product C', price: '¥199', stock: 22 }
]

export default function App() {
  const [loading, setLoading] = useState(false)

  const [pageInfo, setPageInfo] = useState({ current: 1, pageSize: 10 })

  const [lastClicked, setLastClicked] = useState('尚未选择列表项')

  const pagedListData = largeData.slice(
    (pageInfo.current - 1) * pageInfo.pageSize,
    pageInfo.current * pageInfo.pageSize
  )

  const handleItemClick = (item: DemoItem, index: number) => {
    setLastClicked(`${String(item.title ?? item.key ?? '未命名项')}（第 ${index + 1} 项）`)
  }

  const simulateLoading = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  return (
    <>
      <div className="p-6 bg-gray-50 rounded-lg">
        <List dataSource={basicData} />
      </div>
    </>
  )
}

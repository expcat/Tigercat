import { Button } from '@expcat/tigercat-react/Button'
import { List } from '@expcat/tigercat-react/List'

const products = [
  { key: 1, name: '基础套餐', price: '¥99', stock: 15 },
  { key: 2, name: '专业套餐', price: '¥199', stock: 8 }
]

export default function App() {
  return (
    <List
      dataSource={products}
      hoverable
      renderItem={(item) => (
        <div className="flex w-full items-center justify-between">
          <div>
            <div className="font-medium">{String(item.name)}</div>
            <div className="text-sm text-gray-500">库存：{String(item.stock)}</div>
          </div>
          <Button size="sm">{String(item.price)} 购买</Button>
        </div>
      )}
    />
  )
}

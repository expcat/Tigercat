import { Button } from '@expcat/tigercat-react/Button'
import { Empty } from '@expcat/tigercat-react/Empty'

export default function App() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <Empty showImage={false} description="精简模式：隐藏插图，仅保留文字说明。" />
      <Empty
        preset="no-data"
        description="还没有任何数据，先创建一条吧"
        extra={
          <div className="flex justify-center gap-2">
            <Button variant="primary" size="sm">
              新建
            </Button>
            <Button variant="outline" size="sm">
              导入
            </Button>
          </div>
        }
      />
    </div>
  )
}

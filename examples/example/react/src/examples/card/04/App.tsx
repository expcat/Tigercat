import { Card } from '@expcat/tigercat-react/Card'
import { Button } from '@expcat/tigercat-react/Button'

const coverSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="180"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="480" height="180" fill="url(#g)"/></svg>'
const cover = `data:image/svg+xml;utf8,${encodeURIComponent(coverSvg)}`

export default function App() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card
        variant="shadow"
        hoverable
        cover={cover}
        coverAlt="示例封面"
        header={<h3 className="font-semibold">封面与操作</h3>}
        actions={
          <div className="flex gap-2">
            <Button variant="primary" size="sm">
              查看
            </Button>
            <Button variant="ghost" size="sm">
              分享
            </Button>
          </div>
        }>
        <p className="text-sm text-gray-600">cover 渲染顶部封面，actions 固定底部操作区。</p>
      </Card>
      <Card variant="bordered" direction="horizontal" cover={cover} coverAlt="示例封面">
        <h3 className="font-semibold">横向布局</h3>
        <p className="text-sm text-gray-600">direction=&quot;horizontal&quot; 时封面移至左侧。</p>
      </Card>
    </div>
  )
}

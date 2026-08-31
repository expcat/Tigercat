import { Card } from '@expcat/tigercat-react/Card'
import { Button } from '@expcat/tigercat-react/Button'

const cover = 'https://picsum.photos/seed/tiger-card/480/192'

function Actions() {
  return (
    <div className="flex gap-2">
      <Button variant="primary" size="sm">
        查看
      </Button>
      <Button variant="ghost" size="sm">
        分享
      </Button>
    </div>
  )
}

export default function App() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Card
        variant="shadow"
        cover={<img src={cover} alt="" />}
        header={<h3 className="font-semibold">封面与操作</h3>}
        actions={<Actions />}>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          封面走节点；点查看/分享不会点到卡片。
        </p>
      </Card>
      <Card variant="bordered" direction="horizontal" cover={cover} coverAlt="">
        <h3 className="font-semibold">横向布局</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          封面在 inline-start（LTR 左侧，RTL 右侧）。
        </p>
      </Card>
      <div dir="rtl" className="sm:col-span-2">
        <Card variant="bordered" direction="horizontal" cover={cover} coverAlt="">
          <h3 className="font-semibold">RTL</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">dir=rtl 时封面在右侧。</p>
        </Card>
      </div>
    </div>
  )
}

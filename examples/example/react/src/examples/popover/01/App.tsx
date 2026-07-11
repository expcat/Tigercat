import { Button } from '@expcat/tigercat-react/Button'
import { Popover } from '@expcat/tigercat-react/Popover'

export default function App() {
  return (
    <Popover
      title="发布信息"
      content="版本 2.1 将在今晚 22:00 发布。"
      placement="bottom"
      width={240}>
      <Button>查看发布计划</Button>
    </Popover>
  )
}

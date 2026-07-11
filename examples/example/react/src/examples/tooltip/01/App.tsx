import { Button } from '@expcat/tigercat-react/Button'
import { Tooltip } from '@expcat/tigercat-react/Tooltip'

export default function App() {
  return (
    <Tooltip content="保存当前草稿" placement="top" trigger="hover">
      <Button>保存</Button>
    </Tooltip>
  )
}

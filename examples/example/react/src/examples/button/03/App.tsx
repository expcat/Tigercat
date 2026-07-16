import { Button } from '@expcat/tigercat-react/Button'
import { ButtonGroup } from '@expcat/tigercat-react/ButtonGroup'

export default function ButtonGroupExample() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
      <ButtonGroup size="sm">
        <Button>上一页</Button>
        <Button variant="primary">当前页</Button>
        <Button>下一页</Button>
      </ButtonGroup>

      <ButtonGroup size="sm" vertical>
        <Button>上移</Button>
        <Button>置顶</Button>
        <Button>下移</Button>
      </ButtonGroup>
    </div>
  )
}

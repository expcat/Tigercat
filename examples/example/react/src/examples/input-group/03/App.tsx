import { InputGroup } from '@expcat/tigercat-react/InputGroup'
import { Input } from '@expcat/tigercat-react/Input'
import { Select } from '@expcat/tigercat-react/Select'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  return (
    <>
      <div className="space-y-3">
        <InputGroup size="sm">
          <Input placeholder="小尺寸" style={{ flex: 1 }} />
          <Button variant="primary">确定</Button>
        </InputGroup>
        <InputGroup size="md">
          <Input placeholder="中尺寸" style={{ flex: 1 }} />
          <Button variant="primary">确定</Button>
        </InputGroup>
        <InputGroup size="lg">
          <Input placeholder="大尺寸" style={{ flex: 1 }} />
          <Button variant="primary">确定</Button>
        </InputGroup>
      </div>
    </>
  )
}

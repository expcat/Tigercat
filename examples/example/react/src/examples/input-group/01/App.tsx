import { InputGroup } from '@expcat/tigercat-react/InputGroup'
import { Input } from '@expcat/tigercat-react/Input'
import { Select } from '@expcat/tigercat-react/Select'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  return (
    <>
      <InputGroup>
        <Input placeholder="搜索内容" style={{ flex: 1 }} />
        <Button variant="primary">搜索</Button>
      </InputGroup>
    </>
  )
}

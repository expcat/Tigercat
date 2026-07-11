import { InputGroup } from '@expcat/tigercat-react/InputGroup'
import { Input } from '@expcat/tigercat-react/Input'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  return (
    <InputGroup compact size="lg" className="w-full max-w-md">
      <Input aria-label="搜索内容" placeholder="输入关键词" style={{ flex: 1 }} />
      <Button variant="primary">搜索</Button>
    </InputGroup>
  )
}

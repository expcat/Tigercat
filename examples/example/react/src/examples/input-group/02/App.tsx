import { InputGroup } from '@expcat/tigercat-react/InputGroup'
import { InputGroupAddon } from '@expcat/tigercat-react/InputGroupAddon'
import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  return (
    <div className="space-y-3">
      <InputGroup compact className="w-full max-w-md">
        <InputGroupAddon>https://</InputGroupAddon>
        <Input aria-label="站点域名" placeholder="example" style={{ flex: 1 }} />
        <InputGroupAddon>.com</InputGroupAddon>
      </InputGroup>
      <InputGroup compact className="w-full max-w-md">
        <InputGroupAddon addonType="icon">🔍</InputGroupAddon>
        <Input aria-label="搜索" placeholder="搜索内容" style={{ flex: 1 }} />
      </InputGroup>
    </div>
  )
}

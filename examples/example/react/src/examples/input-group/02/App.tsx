import { InputGroup } from '@expcat/tigercat-react/InputGroup'
import { InputGroupAddon } from '@expcat/tigercat-react/InputGroupAddon'
import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  return (
    <div className="space-y-3">
      <InputGroup compact className="w-full max-w-md" aria-label="网址">
        <InputGroupAddon>https://</InputGroupAddon>
        <Input aria-label="站点域名" placeholder="example" />
        <InputGroupAddon>.com</InputGroupAddon>
      </InputGroup>
      <InputGroup compact className="w-full max-w-md" aria-label="搜索带图标">
        <InputGroupAddon>🔍</InputGroupAddon>
        <Input aria-label="搜索" placeholder="搜索内容" />
      </InputGroup>
    </div>
  )
}

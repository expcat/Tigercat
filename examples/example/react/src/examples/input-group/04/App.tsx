import { InputGroup } from '@expcat/tigercat-react/InputGroup'
import { InputGroupAddon } from '@expcat/tigercat-react/InputGroupAddon'
import { Input } from '@expcat/tigercat-react/Input'

export default function App() {
  return (
    <InputGroup compact className="w-full max-w-md" aria-label="带计数的域名">
      <InputGroupAddon>https://</InputGroupAddon>
      <Input aria-label="主机名" defaultValue="example" showCount maxLength={32} />
    </InputGroup>
  )
}

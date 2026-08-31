import { InputGroup } from '@expcat/tigercat-react/InputGroup'
import { Input } from '@expcat/tigercat-react/Input'
import { Button } from '@expcat/tigercat-react/Button'

const sizes = ['sm', 'md', 'lg'] as const

export default function App() {
  return (
    <div className="space-y-3">
      {sizes.map((size) => (
        <InputGroup
          key={size}
          compact
          size={size}
          className="w-full max-w-md"
          aria-label={`尺寸 ${size}`}>
          <Input aria-label={`尺寸 ${size}`} placeholder={`size=${size}`} />
          <Button variant="primary">确定</Button>
        </InputGroup>
      ))}
      <InputGroup size="md" className="w-full max-w-md" aria-label="非紧凑">
        <Input aria-label="非紧凑" placeholder="compact=false（带间距）" />
        <Button variant="outline">操作</Button>
      </InputGroup>
    </div>
  )
}

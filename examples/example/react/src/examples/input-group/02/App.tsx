import { InputGroup } from '@expcat/tigercat-react/InputGroup'
import { Input } from '@expcat/tigercat-react/Input'
import { Select } from '@expcat/tigercat-react/Select'
import { Button } from '@expcat/tigercat-react/Button'

export default function App() {
  return (
    <>
      <InputGroup>
        <Select
          options={[
            { label: 'http://', value: 'http' },
            { label: 'https://', value: 'https' }
          ]}
          value="https"
          style={{ width: 120 }}
        />
        <Input placeholder="请输入域名" style={{ flex: 1 }} />
        <Select
          options={[
            { label: '.com', value: 'com' },
            { label: '.cn', value: 'cn' }
          ]}
          value="com"
          style={{ width: 80 }}
        />
      </InputGroup>
    </>
  )
}

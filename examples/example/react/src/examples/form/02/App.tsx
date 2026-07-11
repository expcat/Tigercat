import { useState } from 'react'
import type { FormRules } from '@expcat/tigercat-react'
import { Button } from '@expcat/tigercat-react/Button'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ]
}

export default function App() {
  const [model, setModel] = useState({ email: '' })

  return (
    <Form model={model} rules={rules} className="max-w-sm">
      <FormItem name="email" label="邮箱" required>
        <Input
          value={model.email}
          onChange={(event) => setModel({ email: event.target.value })}
          placeholder="name@example.com"
        />
      </FormItem>
      <Button htmlType="submit" variant="primary">
        校验并提交
      </Button>
    </Form>
  )
}

import { useState } from 'react'
import type { FormRules } from '@expcat/tigercat-react'
import { Button } from '@expcat/tigercat-react/Button'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'

const rules: FormRules = {
  email: [{ required: true, message: '邮箱不能为空' }]
}

export default function App() {
  const [model, setModel] = useState({ email: '' })

  return (
    <Form model={model} rules={rules} className="max-w-sm">
      <FormItem name="email" label="内联错误" showMessage={false}>
        <Input
          value={model.email}
          onChange={(event) => setModel({ email: event.target.value })}
          placeholder="错误由输入框呈现"
        />
      </FormItem>
      <Button htmlType="submit" variant="primary">
        触发校验
      </Button>
    </Form>
  )
}

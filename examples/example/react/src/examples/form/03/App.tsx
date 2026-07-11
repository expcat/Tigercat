import { useState } from 'react'
import type { FormRules } from '@expcat/tigercat-react'
import { Button } from '@expcat/tigercat-react/Button'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名' },
    {
      validator: async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 400))
        return value === 'admin' ? '用户名已被占用' : true
      }
    }
  ]
}

export default function App() {
  const [model, setModel] = useState({ username: '' })

  return (
    <Form model={model} rules={rules} className="max-w-sm">
      <FormItem name="username" label="用户名" required>
        <Input
          value={model.username}
          onChange={(event) => setModel({ username: event.target.value })}
          placeholder="输入 admin 观察异步错误"
        />
      </FormItem>
      <Button htmlType="submit" variant="primary">
        异步校验
      </Button>
    </Form>
  )
}

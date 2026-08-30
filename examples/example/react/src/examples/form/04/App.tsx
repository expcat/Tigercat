import { useState } from 'react'
import type { FormRules } from '@expcat/tigercat-react'
import { Button } from '@expcat/tigercat-react/Button'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import { Input } from '@expcat/tigercat-react/Input'
import { Space } from '@expcat/tigercat-react/Space'

const rules: FormRules = {
  email: [{ required: true, message: '邮箱不能为空' }],
  role: [{ required: true, message: '请选择角色' }]
}

export default function App() {
  const [model, setModel] = useState({ email: '', role: '' })

  return (
    <Form model={model} onChange={setModel} rules={rules} className="max-w-sm">
      <FormItem name="email" label="邮箱">
        <Space>
          <Input placeholder="不传 required，只靠 rules" />
        </Space>
      </FormItem>
      <FormItem name="role" label="角色">
        <select aria-label="角色" className="w-full rounded border px-2 py-1">
          <option value="">请选择</option>
          <option value="admin">管理员</option>
          <option value="user">用户</option>
        </select>
      </FormItem>
      <Button htmlType="submit" variant="primary">
        提交
      </Button>
    </Form>
  )
}

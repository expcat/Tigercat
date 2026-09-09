import { useState } from 'react'
import { SchemaForm } from '@expcat/tigercat-react/SchemaForm'
import type { SchemaFormSchema, SchemaFormSubmitEvent } from '@expcat/tigercat-core'

const schema: SchemaFormSchema = {
  groups: [
    {
      key: 'account',
      title: '账号',
      columns: 2,
      fields: [
        { name: 'name', label: '姓名', required: true, span: 1 },
        {
          name: 'role',
          label: '角色',
          type: 'select',
          defaultValue: 'staff',
          options: [
            { label: '员工', value: 'staff' },
            { label: '管理员', value: 'admin' }
          ]
        },
        {
          name: 'company',
          label: '公司',
          span: 2,
          condition: { showWhen: { field: 'role', operator: 'equals', value: 'admin' } }
        }
      ]
    },
    {
      key: 'address',
      title: '地址',
      groups: [
        {
          key: 'city',
          title: '城市',
          fields: [
            { name: 'address.city', label: '城市', required: true, defaultValue: '上海' },
            { name: 'notify', label: '邮件通知', type: 'switch', defaultValue: true }
          ]
        }
      ]
    }
  ]
}

export default function App() {
  const [model, setModel] = useState({
    name: '',
    role: 'staff',
    company: '',
    address: { city: '上海' },
    notify: true
  })
  const [message, setMessage] = useState('')

  const handleSubmit = (event: SchemaFormSubmitEvent) => {
    setMessage(event.valid ? JSON.stringify(event.mapped) : '请先修正校验错误')
  }

  return (
    <div className="space-y-3">
      <SchemaForm
        schema={schema}
        model={model}
        labelPosition="top"
        onChange={setModel}
        onSubmit={handleSubmit}
      />
      {message ? <p className="text-sm text-[var(--tiger-text-muted,#6b7280)]">{message}</p> : null}
    </div>
  )
}

import { useState } from 'react'
import { SchemaForm } from '@expcat/tigercat-react/SchemaForm'
import type { FormValues, SchemaFormSchema, SchemaFormSubmitEvent } from '@expcat/tigercat-core'

const schema: SchemaFormSchema = {
  fields: [
    { name: 'name', label: '姓名', required: true, placeholder: '请输入姓名' },
    { name: 'title', label: '职位', placeholder: '可选' },
    { name: 'bio', label: '简介', type: 'textarea', extra: '最多几句话即可' }
  ]
}

export default function App() {
  const [model, setModel] = useState<FormValues>({ name: '', title: '', bio: '' })
  const [message, setMessage] = useState('')

  const handleSubmit = (event: SchemaFormSubmitEvent) => {
    setMessage(event.valid ? `已提交：${String(event.values.name)}` : '请先修正校验错误')
  }

  return (
    <div className="space-y-3">
      <SchemaForm schema={schema} model={model} onChange={setModel} onSubmit={handleSubmit} />
      {message ? <p className="text-sm text-[var(--tiger-text-muted,#6b7280)]">{message}</p> : null}
    </div>
  )
}

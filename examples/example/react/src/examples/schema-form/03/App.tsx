import { useMemo, useState } from 'react'
import {
  applyWorkflowFieldPermissions,
  type FieldPermission,
  type FormValues,
  type SchemaFormSchema,
  type SchemaFormSubmitEvent,
  type WorkflowFieldPermissionMode
} from '@expcat/tigercat-core'
import { SchemaForm } from '@expcat/tigercat-react/SchemaForm'
import { Segmented } from '@expcat/tigercat-react/Segmented'

const starterSchema: SchemaFormSchema = {
  fields: [
    { name: 'reason', label: '请假原因', required: true, placeholder: '请填写原因' },
    { name: 'days', label: '天数', type: 'number', required: true, min: 1 },
    { name: 'amount', label: '金额', type: 'number', extra: '财务节点才可见' }
  ]
}

const nodePermissions: Record<string, FieldPermission> = {
  reason: 'readonly',
  days: 'editable',
  amount: 'hidden'
}

const options = [
  { label: '发起可编', value: 'initiate' },
  { label: '审批人', value: 'approve' },
  { label: '只读', value: 'readonly' }
]

export default function App() {
  const [mode, setMode] = useState<WorkflowFieldPermissionMode>('approve')
  const [model, setModel] = useState<FormValues>({ reason: '年假回家', days: 3, amount: 1200 })
  const [message, setMessage] = useState('')
  const schema = useMemo(
    () =>
      applyWorkflowFieldPermissions(
        starterSchema,
        mode === 'initiate' ? undefined : nodePermissions,
        mode
      ),
    [mode]
  )

  const handleSubmit = (event: SchemaFormSubmitEvent) => {
    setMessage(event.valid ? JSON.stringify(event.values) : '请先修正校验错误')
  }

  return (
    <div className="space-y-3">
      <Segmented
        value={mode}
        onChange={(value) => setMode(String(value) as WorkflowFieldPermissionMode)}
        options={options}
        aria-label="字段权限模式"
      />
      <p className="text-sm text-[var(--tiger-text-muted,#6b7280)]">
        发起模式不套审批节点矩阵，字段都可编。审批人模式隐藏金额、原因只读、天数可改。只读模式不会把可编字段重新打开。
      </p>
      <SchemaForm schema={schema} model={model} onChange={setModel} onSubmit={handleSubmit} />
      {message ? <p className="text-sm text-[var(--tiger-text-muted,#6b7280)]">{message}</p> : null}
    </div>
  )
}

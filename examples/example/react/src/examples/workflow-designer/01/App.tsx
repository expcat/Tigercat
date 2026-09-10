import { useState } from 'react'
import type { SchemaFormSchema, WorkflowTimelineStep } from '@expcat/tigercat-core'
import { WorkflowDesigner } from '@expcat/tigercat-react/WorkflowDesigner'

const schema: SchemaFormSchema = {
  fields: [
    { name: 'reason', label: '请假原因' },
    { name: 'days', label: '天数' },
    { name: 'amount', label: '金额' }
  ]
}

const initialSteps: WorkflowTimelineStep[] = [
  { key: 'start', kind: 'start', title: '提交申请' },
  {
    key: 'split',
    kind: 'condition',
    title: '金额判断',
    children: [
      { key: 'high', title: '大于 1000', expression: 'amount > 1000' },
      { key: 'low', title: '其他', expression: '' }
    ]
  },
  {
    key: 'manager',
    kind: 'approve',
    title: '主管会签',
    signMode: 'countersign',
    approverPolicy: {
      type: 'fixed',
      actors: [
        { id: 'lin', name: '李四' },
        { id: 'qian', name: '钱七' }
      ]
    },
    actors: [{ name: '李四' }, { name: '钱七' }],
    buttonPolicy: {
      buttons: [
        { action: 'approve', enabled: true, placement: 'bar' },
        { action: 'reject', enabled: true, placement: 'bar', commentRequired: true },
        { action: 'addsign', enabled: true, placement: 'more' },
        { action: 'return', enabled: true, placement: 'more', commentRequired: true }
      ],
      addsign: { positions: ['before', 'after'] },
      returnResume: 'resequence'
    },
    fieldPermissions: { amount: 'readonly', reason: 'editable', days: 'editable' },
    advanced: { autoDecide: 'manual', emptyApprover: 'pause', timeout: { action: 'remind' } }
  },
  { key: 'cc-hr', kind: 'cc', title: '抄送 HR', approverPolicy: { type: 'role', key: 'hr' } },
  { key: 'end', kind: 'end', title: '结束' }
]

export default function App() {
  const [steps, setSteps] = useState(initialSteps)

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--tiger-text-muted,#6b7280)]">
        画布摘要卡 + 右侧 Inspector 四 Tab（审批人 / 操作按钮 / 表单权限 / 高级）。节点间 +
        打开调色板插入；条件分支是标签 + 表达式 stub。不是 BPMN。
      </p>
      <WorkflowDesigner value={steps} schema={schema} onChange={setSteps} />
      <pre className="overflow-auto rounded-md bg-[var(--tiger-fill,#f3f4f6)] p-3 text-xs">
        {JSON.stringify(steps, null, 2)}
      </pre>
    </div>
  )
}

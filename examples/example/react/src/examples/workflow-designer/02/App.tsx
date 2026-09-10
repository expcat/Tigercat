import { useState } from 'react'
import type { SchemaFormSchema, WorkflowTimelineStep } from '@expcat/tigercat-core'
import { WorkflowDesigner } from '@expcat/tigercat-react/WorkflowDesigner'

const schema: SchemaFormSchema = {
  fields: [
    { name: 'reason', label: '请假原因' },
    { name: 'amount', label: '金额' }
  ]
}

const initialSteps: WorkflowTimelineStep[] = [
  { key: 'start', kind: 'start', title: '提交申请' },
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
    children: [
      { key: 'cc-hr', kind: 'cc', title: '抄送 HR' },
      { key: 'cc-fin', kind: 'cc', title: '抄送财务' }
    ]
  },
  { key: 'end', kind: 'end', title: '结束' }
]

export default function App() {
  const [steps, setSteps] = useState(initialSteps)

  return (
    <div className="space-y-3">
      <p className="text-sm text-[var(--tiger-text-muted,#6b7280)]">
        path 只编辑主管会签的子节点（抄送/并行，不是审批人），Inspector 仍可改选中节点；onChange
        回写整棵树。
      </p>
      <WorkflowDesigner value={steps} path={['manager']} schema={schema} onChange={setSteps} />
      <pre className="overflow-auto rounded-md bg-[var(--tiger-fill,#f3f4f6)] p-3 text-xs">
        {JSON.stringify(steps, null, 2)}
      </pre>
    </div>
  )
}

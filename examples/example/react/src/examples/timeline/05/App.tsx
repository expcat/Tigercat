import { useState } from 'react'
import type {
  WorkflowActionBarItem,
  WorkflowActionPayload,
  WorkflowTimelineStep
} from '@expcat/tigercat-core'
import { WorkflowActionBar } from '@expcat/tigercat-react/WorkflowTimeline'
import { WorkflowViewer } from '@expcat/tigercat-react/WorkflowViewer'

const steps: WorkflowTimelineStep[] = [
  {
    key: 'start',
    kind: 'start',
    title: '提交申请',
    status: 'approved',
    actor: { name: '张三' },
    time: '2026-09-01 09:12',
    order: 1
  },
  {
    key: 'draft',
    title: '初审',
    status: 'rejected',
    rollbackPoint: true,
    actor: { name: '李四' },
    comment: '请补充发票后重提。',
    time: '2026-09-01 11:00',
    order: 2
  },
  {
    key: 'manager',
    title: '主管会签',
    status: 'approved',
    signMode: 'countersign',
    time: '2026-09-02 10:00',
    order: 3,
    actors: [
      { name: '李四', status: 'approved' },
      { name: '钱七', status: 'approved' }
    ]
  },
  {
    key: 'cc',
    kind: 'cc',
    title: '抄送 HR',
    status: 'canceled',
    actor: { name: 'HR' },
    time: '2026-09-02 10:01',
    order: 4
  },
  {
    key: 'cond',
    kind: 'condition',
    title: '金额判断',
    status: 'approved',
    order: 5,
    children: [
      { key: 'low', title: '≤ 5000 自动', status: 'approved' },
      { key: 'high', title: '> 5000 总监审批', status: 'pending' }
    ]
  },
  {
    key: 'director',
    title: '总监审批',
    status: 'active',
    signMode: 'orsign',
    actor: { name: '王五' },
    time: '待处理',
    order: 6
  },
  {
    key: 'finance',
    title: '财务复核',
    status: 'pending',
    actor: { name: '赵六' },
    order: 7
  }
]

const actions: WorkflowActionBarItem[] = [
  { key: 'approve', label: '同意', action: 'approve', variant: 'primary' },
  { key: 'reject', label: '拒绝', action: 'reject', variant: 'danger' },
  { key: 'transfer', label: '转交', action: 'transfer', variant: 'outline' },
  { key: 'comment', label: '评论', action: 'comment', variant: 'ghost' },
  { key: 'cancel', label: '撤回', action: 'cancel', variant: 'danger', disabled: true }
]

export default function App() {
  const [lastAction, setLastAction] = useState('')

  function onAction(item: WorkflowActionBarItem, payload?: WorkflowActionPayload) {
    const comment = payload?.comment?.trim()
    setLastAction(comment ? `${item.label}（${comment}）` : item.label)
  }

  return (
    <div className="space-y-4">
      <WorkflowViewer steps={steps} />
      <WorkflowActionBar items={actions} confirm onAction={onAction} />
      {lastAction ? (
        <p className="text-sm text-[var(--tiger-text-muted)]">最近操作：{lastAction}</p>
      ) : null}
    </div>
  )
}

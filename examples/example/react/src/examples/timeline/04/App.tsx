import { useState } from 'react'
import type {
  WorkflowActionBarItem,
  WorkflowActionPayload,
  WorkflowTimelineStep
} from '@expcat/tigercat-core'
import { WorkflowTimeline } from '@expcat/tigercat-react/WorkflowTimeline'

const steps: WorkflowTimelineStep[] = [
  {
    key: 'submit',
    title: '提交申请',
    status: 'approved',
    actor: { name: '张三' },
    comment: '请审批差旅报销。',
    time: '2026-09-01 09:12',
    action: 'approve',
    order: 1
  },
  {
    key: 'manager',
    title: '主管会签',
    status: 'approved',
    signMode: 'countersign',
    actors: [
      { name: '李四', status: 'approved' },
      { name: '钱七', status: 'approved' }
    ],
    comment: '同意，金额合理。',
    time: '2026-09-01 14:30',
    action: 'approve',
    order: 2,
    children: [
      {
        key: 'cc',
        kind: 'cc',
        title: '抄送 HR',
        status: 'canceled',
        actor: { name: 'HR' },
        time: '2026-09-01 14:31'
      }
    ]
  },
  {
    key: 'director',
    title: '总监审批',
    status: 'active',
    actor: { name: '王五' },
    time: '待处理',
    order: 3
  },
  {
    key: 'finance',
    title: '财务复核',
    status: 'pending',
    actor: { name: '赵六' },
    order: 4
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
    <div className="space-y-3">
      <WorkflowTimeline steps={steps} actions={actions} confirm onAction={onAction} />
      {lastAction ? (
        <p className="text-sm text-[var(--tiger-text-muted)]">最近操作：{lastAction}</p>
      ) : null}
    </div>
  )
}

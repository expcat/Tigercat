import { useState } from 'react'
import type {
  WorkflowActionBarItem,
  WorkflowActionPayload,
  WorkflowTimelineActor,
  WorkflowTimelineStep
} from '@expcat/tigercat-core'
import { listWorkflowReturnTargets } from '@expcat/tigercat-core'
import { Radio } from '@expcat/tigercat-react/Radio'
import { RadioGroup } from '@expcat/tigercat-react/RadioGroup'
import { WorkflowActionBar } from '@expcat/tigercat-react/WorkflowTimeline'
import { WorkflowViewer } from '@expcat/tigercat-react/WorkflowViewer'

const steps: WorkflowTimelineStep[] = [
  {
    key: 'start',
    kind: 'start',
    title: '提交申请',
    status: 'approved',
    actor: { id: 'zhang', name: '张三' },
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
      { id: 'li', name: '李四', status: 'approved' },
      { id: 'qian', name: '钱七', status: 'approved' }
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
    actor: { id: 'wang', name: '王五' },
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
  { key: 'reject', label: '拒绝', action: 'reject', variant: 'danger', commentRequired: true },
  { key: 'comment', label: '评论', action: 'comment', variant: 'ghost' },
  { key: 'cancel', label: '撤回', action: 'cancel', variant: 'danger' },
  { key: 'transfer', label: '转交', action: 'transfer', variant: 'outline', placement: 'more' },
  { key: 'addsign', label: '加签', action: 'addsign', variant: 'outline', placement: 'more' },
  { key: 'return', label: '退回', action: 'return', variant: 'outline', placement: 'more' },
  {
    key: 'request_changes',
    label: '退回修改',
    action: 'request_changes',
    variant: 'outline',
    placement: 'more'
  }
]

const people: WorkflowTimelineActor[] = [
  { id: 'li', name: '李四' },
  { id: 'qian', name: '钱七' },
  { id: 'expert', name: '专家' }
]

const returnTargets = listWorkflowReturnTargets(steps)

export default function App() {
  const [lastAction, setLastAction] = useState('')

  function onAction(item: WorkflowActionBarItem, payload?: WorkflowActionPayload) {
    const bits = [item.label]
    if (payload?.position === 'before') bits.push('前加签')
    if (payload?.position === 'after') bits.push('后加签')
    if (payload?.assignee?.name) bits.push(payload.assignee.name)
    if (payload?.targetNodeKey) bits.push(payload.targetNodeKey)
    const comment = payload?.comment?.trim()
    if (comment) bits.push(comment)
    setLastAction(bits.join(' · '))
  }

  return (
    <div className="space-y-4">
      <WorkflowViewer steps={steps} />
      <WorkflowActionBar
        items={actions}
        returnTargets={returnTargets}
        addsignPositions={['before', 'after']}
        confirm
        isStarter
        onAction={onAction}
        renderAssigneePicker={({ value, onChange }) => (
          <RadioGroup
            size="sm"
            value={value?.id}
            onChange={(id) => onChange(people.find((person) => String(person.id) === String(id)))}>
            {people.map((person) => (
              <Radio key={String(person.id)} value={String(person.id)}>
                {person.name}
              </Radio>
            ))}
          </RadioGroup>
        )}
      />
      {lastAction ? (
        <p className="text-sm text-[var(--tiger-text-muted)]">最近操作：{lastAction}</p>
      ) : null}
    </div>
  )
}

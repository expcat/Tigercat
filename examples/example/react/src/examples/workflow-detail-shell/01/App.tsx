import { useMemo, useState } from 'react'
import {
  applyWorkflowFieldPermissions,
  type FieldPermission,
  type FormValues,
  type SchemaFormSchema,
  type WorkflowActionBarItem,
  type WorkflowActionPayload,
  type WorkflowTask,
  type WorkflowTimelineStep
} from '@expcat/tigercat-core'
import { SchemaForm } from '@expcat/tigercat-react/SchemaForm'
import { TabPane } from '@expcat/tigercat-react/TabPane'
import { Tabs } from '@expcat/tigercat-react/Tabs'
import { Tag } from '@expcat/tigercat-react/Tag'
import { WorkflowDetailShell } from '@expcat/tigercat-react/WorkflowDetailShell'
import { WorkflowActionBar, WorkflowTimeline } from '@expcat/tigercat-react/WorkflowTimeline'
import { WorkflowViewer } from '@expcat/tigercat-react/WorkflowViewer'

const starterSchema: SchemaFormSchema = {
  fields: [
    { name: 'reason', label: '请假原因', required: true },
    { name: 'days', label: '天数', type: 'number', required: true },
    { name: 'amount', label: '金额', type: 'number' }
  ]
}

const fieldPermissions: Record<string, FieldPermission> = {
  reason: 'readonly',
  days: 'editable',
  amount: 'hidden'
}

const steps: WorkflowTimelineStep[] = [
  {
    key: 'start',
    kind: 'start',
    title: '提交申请',
    status: 'approved',
    actor: { id: 'zhang', name: '张三' },
    time: '2026-09-01 09:12'
  },
  {
    key: 'manager',
    title: '主管审批',
    status: 'active',
    fieldPermissions,
    actor: { id: 'li', name: '李四' },
    time: '进行中'
  },
  { key: 'end', kind: 'end', title: '结束', status: 'pending' }
]

const tasks: WorkflowTask[] = [
  {
    id: 't-li',
    nodeKey: 'manager',
    assignee: { id: 'li', name: '李四' },
    status: 'pending'
  }
]

const actions: WorkflowActionBarItem[] = [
  { key: 'approve', label: '同意', action: 'approve', variant: 'primary' },
  { key: 'reject', label: '拒绝', action: 'reject', variant: 'danger', commentRequired: true },
  { key: 'comment', label: '评论', action: 'comment', variant: 'ghost' }
]

export default function App() {
  const schema = useMemo(
    () => applyWorkflowFieldPermissions(starterSchema, fieldPermissions, 'approve'),
    []
  )
  const [model, setModel] = useState<FormValues>({ reason: '年假回家', days: 3, amount: 1200 })
  const [lastAction, setLastAction] = useState('')

  const onAction = (item: WorkflowActionBarItem, payload?: WorkflowActionPayload) => {
    const comment = payload?.comment?.trim()
    setLastAction(comment ? `${item.label} · ${comment}` : item.label)
  }

  return (
    <div className="flex h-[32rem] min-h-0 flex-col">
      <WorkflowDetailShell
        className="h-full min-h-0"
        ariaLabel="请假审批详情"
        header={
          <div className="flex flex-wrap items-center gap-2">
            <strong>请假申请</strong>
            <Tag variant="primary" size="sm">
              审批中
            </Tag>
            <span className="text-sm text-[var(--tiger-text-muted,#6b7280)]">
              金额字段对本节点隐藏
            </span>
          </div>
        }
        form={<SchemaForm schema={schema} model={model} onChange={setModel} showActions={false} />}
        tabs={
          <Tabs defaultActiveKey="timeline">
            <TabPane tabKey="timeline" label="进度">
              <WorkflowTimeline steps={steps} tasks={tasks} showActions={false} />
            </TabPane>
            <TabPane tabKey="viewer" label="结构">
              <WorkflowViewer steps={steps} tasks={tasks} />
            </TabPane>
          </Tabs>
        }
        action={
          <div className="flex flex-wrap items-center justify-between gap-3">
            {lastAction ? (
              <p className="m-0 text-sm text-[var(--tiger-text-muted,#6b7280)]">
                最近操作：{lastAction}
              </p>
            ) : null}
            <WorkflowActionBar items={actions} confirm onAction={onAction} />
          </div>
        }
      />
    </div>
  )
}

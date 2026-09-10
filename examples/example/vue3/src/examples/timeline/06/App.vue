<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  applyWorkflowFieldPermissions,
  type FieldPermission,
  type SchemaFormSchema,
  type WorkflowActionBarItem,
  type WorkflowActionPayload,
  type WorkflowTask,
  type WorkflowTimelineStep
} from '@expcat/tigercat-core'
import { SchemaForm } from '@expcat/tigercat-vue/SchemaForm'
import { TabPane } from '@expcat/tigercat-vue/TabPane'
import { Tabs } from '@expcat/tigercat-vue/Tabs'
import { Tag } from '@expcat/tigercat-vue/Tag'
import { WorkflowDetailShell } from '@expcat/tigercat-vue/WorkflowDetailShell'
import { WorkflowActionBar, WorkflowTimeline } from '@expcat/tigercat-vue/WorkflowTimeline'
import { WorkflowViewer } from '@expcat/tigercat-vue/WorkflowViewer'

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

const schema = computed(() =>
  applyWorkflowFieldPermissions(starterSchema, fieldPermissions, 'approve')
)

const model = reactive({ reason: '年假回家', days: 3, amount: 1200 })

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

const lastAction = ref('')

function onAction(item: WorkflowActionBarItem, payload?: WorkflowActionPayload) {
  const comment = payload?.comment?.trim()
  lastAction.value = comment ? `${item.label} · ${comment}` : item.label
}
</script>

<template>
  <WorkflowDetailShell class="h-[32rem]" aria-label="请假审批详情">
    <template #header>
      <div class="flex flex-wrap items-center gap-2">
        <strong>请假申请</strong>
        <Tag variant="primary" size="sm">审批中</Tag>
        <span class="text-sm text-[var(--tiger-text-muted,#6b7280)]">金额字段对本节点隐藏</span>
      </div>
    </template>
    <template #form>
      <SchemaForm :schema="schema" :model="model" :show-actions="false" />
    </template>
    <template #tabs>
      <Tabs default-active-key="timeline">
        <TabPane tab-key="timeline" label="进度">
          <WorkflowTimeline :steps="steps" :tasks="tasks" :show-actions="false" />
        </TabPane>
        <TabPane tab-key="viewer" label="结构">
          <WorkflowViewer :steps="steps" :tasks="tasks" />
        </TabPane>
      </Tabs>
    </template>
    <template #action>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p v-if="lastAction" class="m-0 text-sm text-[var(--tiger-text-muted,#6b7280)]">
          最近操作：{{ lastAction }}
        </p>
        <WorkflowActionBar :items="actions" confirm @action="onAction" />
      </div>
    </template>
  </WorkflowDetailShell>
</template>

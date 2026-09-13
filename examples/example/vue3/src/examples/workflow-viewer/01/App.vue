<script setup lang="ts">
import { ref } from 'vue'
import type {
  WorkflowActionBarItem,
  WorkflowActionPayload,
  WorkflowTask,
  WorkflowTimelineActor,
  WorkflowTimelineStep
} from '@expcat/tigercat-core'
import { listWorkflowReturnTargets } from '@expcat/tigercat-core'
import { Radio } from '@expcat/tigercat-vue/Radio'
import { RadioGroup } from '@expcat/tigercat-vue/RadioGroup'
import { WorkflowActionBar } from '@expcat/tigercat-vue/WorkflowTimeline'
import { WorkflowViewer } from '@expcat/tigercat-vue/WorkflowViewer'

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
    key: 'add-after',
    title: '专家后加签',
    status: 'approved',
    temporary: true,
    origin: { type: 'addsign', position: 'after', fromNodeKey: 'start' },
    actor: { id: 'expert', name: '专家' },
    comment: '已会签补充意见。',
    time: '2026-09-01 10:40',
    order: 2
  },
  {
    key: 'cond',
    kind: 'condition',
    title: '金额判断',
    status: 'approved',
    order: 3,
    children: [
      { key: 'low', title: '≤ 5000 自动', status: 'approved' },
      { key: 'high', title: '> 5000 总监审批', status: 'pending' }
    ]
  },
  {
    key: 'manager',
    title: '主管会签',
    status: 'active',
    signMode: 'countersign',
    returnTarget: true,
    time: '退回后重审',
    order: 4,
    actors: [
      { id: 'li', name: '李四', status: 'pending' },
      { id: 'qian', name: '钱七', status: 'pending' }
    ]
  },
  {
    key: 'cc',
    kind: 'cc',
    title: '抄送 HR',
    status: 'canceled',
    actor: { name: 'HR' },
    time: '2026-09-02 10:01',
    order: 5
  },
  {
    key: 'director',
    title: '总监审批',
    status: 'pending',
    signMode: 'orsign',
    actor: { id: 'wang', name: '王五' },
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

const tasks: WorkflowTask[] = [
  {
    id: 't-li',
    nodeKey: 'manager',
    assignee: { id: 'li', name: '李四' },
    status: 'pending',
    origin: 'return'
  },
  {
    id: 't-qian',
    nodeKey: 'manager',
    assignee: { id: 'qian', name: '钱七' },
    status: 'pending',
    origin: 'return'
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
const lastAction = ref('')

function onAction(item: WorkflowActionBarItem, payload?: WorkflowActionPayload) {
  const bits = [item.label]
  if (payload?.position === 'before') bits.push('前加签')
  if (payload?.position === 'after') bits.push('后加签')
  if (payload?.assignee?.name) bits.push(payload.assignee.name)
  if (payload?.targetNodeKey) bits.push(payload.targetNodeKey)
  const comment = payload?.comment?.trim()
  if (comment) bits.push(comment)
  lastAction.value = bits.join(' · ')
}

function pickPerson(
  id: string | number,
  onChange: (actor: WorkflowTimelineActor | undefined) => void
) {
  onChange(people.find((person) => String(person.id) === String(id)))
}
</script>

<template>
  <div class="space-y-4">
    <WorkflowViewer :steps="steps" :tasks="tasks" />
    <WorkflowActionBar
      :items="actions"
      :return-targets="returnTargets"
      :addsign-positions="['before', 'after']"
      confirm
      is-starter
      @action="onAction">
      <template #assigneePicker="{ value, onChange }">
        <RadioGroup
          size="sm"
          :model-value="value?.id"
          @update:model-value="(id) => pickPerson(id, onChange)">
          <Radio v-for="person in people" :key="String(person.id)" :value="String(person.id)">
            {{ person.name }}
          </Radio>
        </RadioGroup>
      </template>
    </WorkflowActionBar>
    <p v-if="lastAction" class="text-sm text-[var(--tiger-text-muted)]">
      最近操作：{{ lastAction }}
    </p>
  </div>
</template>

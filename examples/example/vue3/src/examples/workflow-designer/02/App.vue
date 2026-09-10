<script setup lang="ts">
import { ref } from 'vue'
import type { SchemaFormSchema, WorkflowTimelineStep } from '@expcat/tigercat-core'
import { WorkflowDesigner } from '@expcat/tigercat-vue/WorkflowDesigner'

const schema: SchemaFormSchema = {
  fields: [
    { name: 'reason', label: '请假原因' },
    { name: 'amount', label: '金额' }
  ]
}

const steps = ref<WorkflowTimelineStep[]>([
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
])
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-[var(--tiger-text-muted,#6b7280)]">
      path 只编辑主管会签的子节点（抄送/并行，不是审批人），Inspector 仍可改选中节点；onChange
      回写整棵树。
    </p>
    <WorkflowDesigner v-model="steps" :path="['manager']" :schema="schema" />
    <pre class="overflow-auto rounded-md bg-[var(--tiger-fill,#f3f4f6)] p-3 text-xs">{{
      JSON.stringify(steps, null, 2)
    }}</pre>
  </div>
</template>

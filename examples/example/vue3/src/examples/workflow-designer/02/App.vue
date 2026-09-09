<script setup lang="ts">
import { ref } from 'vue'
import type { WorkflowTimelineStep } from '@expcat/tigercat-core'
import { WorkflowDesigner } from '@expcat/tigercat-vue/WorkflowDesigner'

const steps = ref<WorkflowTimelineStep[]>([
  { key: 'start', kind: 'start', title: '提交申请' },
  {
    key: 'manager',
    title: '主管会签',
    signMode: 'countersign',
    actors: [{ name: '李四' }, { name: '钱七' }],
    children: [
      { key: 'cc-hr', kind: 'cc', title: '抄送 HR' },
      { key: 'cc-fin', kind: 'cc', title: '抄送财务' }
    ]
  },
  { key: 'finance', title: '财务复核' }
])
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-[var(--tiger-text-muted,#6b7280)]">
      只编辑主管会签的子节点（抄送），回写整棵树。审批人用 actors，不要把人做成 children。
    </p>
    <WorkflowDesigner v-model="steps" :path="['manager']" />
    <pre class="overflow-auto rounded-md bg-[var(--tiger-fill,#f3f4f6)] p-3 text-xs">{{
      JSON.stringify(steps, null, 2)
    }}</pre>
  </div>
</template>

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
    children: [
      { key: 'm1', title: '李四' },
      { key: 'm2', title: '钱七' }
    ]
  },
  { key: 'finance', title: '财务复核' }
])
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-[var(--tiger-text-muted,#6b7280)]">
      只编辑主管会签的子节点，回写整棵树。
    </p>
    <WorkflowDesigner v-model="steps" :path="['manager']" />
    <pre class="overflow-auto rounded-md bg-[var(--tiger-fill,#f3f4f6)] p-3 text-xs">{{
      JSON.stringify(steps, null, 2)
    }}</pre>
  </div>
</template>

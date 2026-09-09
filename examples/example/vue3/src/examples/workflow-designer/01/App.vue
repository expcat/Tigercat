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
    actors: [{ name: '李四' }, { name: '钱七' }]
  },
  { key: 'finance', title: '财务复核' }
])
</script>

<template>
  <div class="space-y-3">
    <p class="text-sm text-[var(--tiger-text-muted,#6b7280)]">
      摘要卡扫读；点选后在右侧或下方编辑。节点间「在后方插入」添加兄弟审批，不是 BPMN。
    </p>
    <WorkflowDesigner v-model="steps" />
    <pre class="overflow-auto rounded-md bg-[var(--tiger-fill,#f3f4f6)] p-3 text-xs">{{
      JSON.stringify(steps, null, 2)
    }}</pre>
  </div>
</template>

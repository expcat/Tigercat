<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  applyWorkflowFieldPermissions,
  type FieldPermission,
  type SchemaFormSchema,
  type SchemaFormSubmitEvent,
  type WorkflowFieldPermissionMode
} from '@expcat/tigercat-core'
import { SchemaForm } from '@expcat/tigercat-vue/SchemaForm'
import { Segmented } from '@expcat/tigercat-vue/Segmented'

const starterSchema: SchemaFormSchema = {
  fields: [
    { name: 'reason', label: '请假原因', required: true, placeholder: '请填写原因' },
    { name: 'days', label: '天数', type: 'number', required: true, min: 1 },
    { name: 'amount', label: '金额', type: 'number', extra: '财务节点才可见' }
  ]
}

const nodePermissions: Record<string, FieldPermission> = {
  reason: 'readonly',
  days: 'editable',
  amount: 'hidden'
}

const mode = ref<WorkflowFieldPermissionMode>('approve')
const options = [
  { label: '发起可编', value: 'initiate' },
  { label: '审批人', value: 'approve' },
  { label: '只读', value: 'readonly' }
]

const schema = computed(() =>
  applyWorkflowFieldPermissions(
    starterSchema,
    mode.value === 'initiate' ? undefined : nodePermissions,
    mode.value
  )
)

const model = reactive({ reason: '年假回家', days: 3, amount: 1200 })
const message = ref('')

const handleSubmit = (event: SchemaFormSubmitEvent) => {
  message.value = event.valid ? JSON.stringify(event.values) : '请先修正校验错误'
}
</script>

<template>
  <div class="space-y-3">
    <Segmented v-model="mode" :options="options" aria-label="字段权限模式" />
    <p class="text-sm text-[var(--tiger-text-muted,#6b7280)]">
      发起模式不套审批节点矩阵，字段都可编。审批人模式隐藏金额、原因只读、天数可改。只读模式不会把可编字段重新打开。
    </p>
    <SchemaForm :schema="schema" :model="model" @submit="handleSubmit" />
    <p v-if="message" class="text-sm text-[var(--tiger-text-muted,#6b7280)]">{{ message }}</p>
  </div>
</template>

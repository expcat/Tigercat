<script setup lang="ts">
import { reactive, ref } from 'vue'
import { SchemaForm } from '@expcat/tigercat-vue/SchemaForm'
import type { SchemaFormSchema, SchemaFormSubmitEvent } from '@expcat/tigercat-core'

const schema: SchemaFormSchema = {
  groups: [
    {
      key: 'account',
      title: '账号',
      columns: 2,
      fields: [
        { name: 'name', label: '姓名', required: true, span: 1 },
        {
          name: 'role',
          label: '角色',
          type: 'select',
          defaultValue: 'staff',
          options: [
            { label: '员工', value: 'staff' },
            { label: '管理员', value: 'admin' }
          ]
        },
        {
          name: 'company',
          label: '公司',
          span: 2,
          condition: { showWhen: { field: 'role', operator: 'equals', value: 'admin' } }
        }
      ]
    },
    {
      key: 'address',
      title: '地址',
      groups: [
        {
          key: 'city',
          title: '城市',
          fields: [
            { name: 'address.city', label: '城市', required: true, defaultValue: '上海' },
            { name: 'notify', label: '邮件通知', type: 'switch', defaultValue: true }
          ]
        }
      ]
    }
  ]
}

const model = reactive({
  name: '',
  role: 'staff',
  company: '',
  address: { city: '上海' },
  notify: true
})
const message = ref('')

const handleSubmit = (event: SchemaFormSubmitEvent) => {
  message.value = event.valid ? JSON.stringify(event.mapped) : '请先修正校验错误'
}
</script>

<template>
  <div class="space-y-3">
    <SchemaForm :schema="schema" :model="model" label-position="top" @submit="handleSubmit" />
    <p v-if="message" class="text-sm text-[var(--tiger-text-muted,#6b7280)]">{{ message }}</p>
  </div>
</template>

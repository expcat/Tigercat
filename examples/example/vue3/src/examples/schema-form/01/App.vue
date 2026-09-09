<script setup lang="ts">
import { reactive, ref } from 'vue'
import { SchemaForm } from '@expcat/tigercat-vue/SchemaForm'
import type { SchemaFormSchema, SchemaFormSubmitEvent } from '@expcat/tigercat-core'

const schema: SchemaFormSchema = {
  fields: [
    { name: 'name', label: '姓名', required: true, placeholder: '请输入姓名' },
    { name: 'title', label: '职位', placeholder: '可选' },
    { name: 'bio', label: '简介', type: 'textarea', extra: '最多几句话即可' }
  ]
}

const model = reactive({ name: '', title: '', bio: '' })
const message = ref('')

const handleSubmit = (event: SchemaFormSubmitEvent) => {
  message.value = event.valid ? `已提交：${String(event.values.name)}` : '请先修正校验错误'
}
</script>

<template>
  <div class="space-y-3">
    <SchemaForm :schema="schema" :model="model" @submit="handleSubmit" />
    <p v-if="message" class="text-sm text-[var(--tiger-text-muted,#6b7280)]">{{ message }}</p>
  </div>
</template>

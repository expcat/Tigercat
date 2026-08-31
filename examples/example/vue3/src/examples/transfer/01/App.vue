<script setup lang="ts">
import { reactive } from 'vue'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Transfer } from '@expcat/tigercat-vue/Transfer'

const model = reactive<{ team: (string | number)[] }>({ team: ['frontend'] })
const dataSource = [
  { key: 'design', label: '设计' },
  { key: 'frontend', label: '前端' },
  { key: 'backend', label: '后端' },
  { key: 'qa', label: '测试' }
]
</script>

<template>
  <Form :model="model" label-position="top">
    <FormItem name="team" label="团队">
      <Transfer v-model="model.team" :data-source="dataSource" searchable class="max-w-2xl" />
    </FormItem>
  </Form>
</template>

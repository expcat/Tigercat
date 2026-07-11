<script setup lang="ts">
import { reactive } from 'vue'
import type { FormRules } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-vue/Button'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Input } from '@expcat/tigercat-vue/Input'

const model = reactive({ email: '' })
const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱' },
    { type: 'email', message: '请输入有效的邮箱地址' }
  ]
}
</script>

<template>
  <Form :model="model" :rules="rules" class="max-w-sm">
    <FormItem name="email" label="邮箱" required>
      <Input v-model="model.email" placeholder="name@example.com" />
    </FormItem>
    <Button html-type="submit" variant="primary">校验并提交</Button>
  </Form>
</template>

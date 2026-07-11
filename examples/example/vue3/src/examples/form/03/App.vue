<script setup lang="ts">
import { reactive } from 'vue'
import type { FormRules } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-vue/Button'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Input } from '@expcat/tigercat-vue/Input'

const model = reactive({ username: '' })
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名' },
    {
      validator: async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 400))
        return value === 'admin' ? '用户名已被占用' : true
      }
    }
  ]
}
</script>

<template>
  <Form :model="model" :rules="rules" class="max-w-sm">
    <FormItem name="username" label="用户名" required>
      <Input v-model="model.username" placeholder="输入 admin 观察异步错误" />
    </FormItem>
    <Button html-type="submit" variant="primary">异步校验</Button>
  </Form>
</template>

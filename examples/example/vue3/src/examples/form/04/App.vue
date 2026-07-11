<script setup lang="ts">
import { reactive } from 'vue'
import type { FormRules } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-vue/Button'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Input } from '@expcat/tigercat-vue/Input'

const model = reactive({ email: '' })
const rules: FormRules = {
  email: [{ required: true, message: '邮箱不能为空' }]
}
</script>

<template>
  <Form :model="model" :rules="rules" class="max-w-sm">
    <FormItem name="email" label="内联错误" :show-message="false">
      <Input v-model="model.email" placeholder="错误由输入框呈现" />
    </FormItem>
    <Button html-type="submit" variant="primary">触发校验</Button>
  </Form>
</template>

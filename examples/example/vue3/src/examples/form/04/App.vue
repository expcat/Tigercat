<script setup lang="ts">
import { reactive } from 'vue'
import type { FormRules } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-vue/Button'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Input } from '@expcat/tigercat-vue/Input'
import { Space } from '@expcat/tigercat-vue/Space'

const model = reactive({ email: '', role: '' })
const rules: FormRules = {
  email: [{ required: true, message: '邮箱不能为空' }],
  role: [{ required: true, message: '请选择角色' }]
}
</script>

<template>
  <Form :model="model" :rules="rules" class="max-w-sm">
    <FormItem name="email" label="邮箱">
      <Space>
        <Input placeholder="不传 required，只靠 rules" />
      </Space>
    </FormItem>
    <FormItem name="role" label="角色">
      <select aria-label="角色" class="w-full rounded border px-2 py-1">
        <option value="">请选择</option>
        <option value="admin">管理员</option>
        <option value="user">用户</option>
      </select>
    </FormItem>
    <Button html-type="submit" variant="primary">提交</Button>
  </Form>
</template>

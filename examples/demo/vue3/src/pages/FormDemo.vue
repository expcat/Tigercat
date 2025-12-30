<script setup lang="ts">
import { ref } from 'vue'
import { Form, FormItem, Input, Textarea, Select, Checkbox, Radio, RadioGroup, Button, Space, Divider } from '@tigercat/vue'
import { countries } from '../../../shared/constants'

const formData = ref({
  username: '',
  email: '',
  gender: 'male',
  country: 'china',
  bio: '',
  agreement: false,
})

const handleSubmit = () => {
  console.log('表单提交:', formData.value)
  alert('表单提交成功！请查看控制台。')
}

const handleReset = () => {
  formData.value = {
    username: '',
    email: '',
    gender: 'male',
    country: 'china',
    bio: '',
    agreement: false,
  }
}
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Form 表单</h1>
      <p class="text-gray-600">由输入框、选择器、单选框、多选框等控件组成，用以收集、校验、提交数据。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">完整的表单示例，包含多种表单控件。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Form @submit="handleSubmit" class="max-w-md">
          <FormItem label="用户名" required>
            <Input v-model="formData.username" placeholder="请输入用户名" />
          </FormItem>

          <FormItem label="邮箱" required>
            <Input v-model="formData.email" type="email" placeholder="请输入邮箱" />
          </FormItem>

          <FormItem label="性别">
            <RadioGroup v-model="formData.gender">
              <Radio value="male">男</Radio>
              <Radio value="female">女</Radio>
              <Radio value="other">其他</Radio>
            </RadioGroup>
          </FormItem>

          <FormItem label="国家">
            <Select v-model="formData.country" :options="countries" />
          </FormItem>

          <FormItem label="个人简介">
            <Textarea v-model="formData.bio" placeholder="请输入个人简介" :rows="4" />
          </FormItem>

          <FormItem>
            <Checkbox v-model="formData.agreement">
              我已阅读并同意用户协议
            </Checkbox>
          </FormItem>

          <FormItem>
            <Space>
              <Button type="submit" variant="primary">提交</Button>
              <Button type="button" variant="secondary" @click="handleReset">重置</Button>
            </Space>
          </FormItem>
        </Form>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 表单数据预览 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">表单数据预览</h2>
      <div class="p-6 bg-gray-50 rounded-lg">
        <pre class="text-sm text-gray-700 bg-white p-4 rounded border">{{ JSON.stringify(formData, null, 2) }}</pre>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>

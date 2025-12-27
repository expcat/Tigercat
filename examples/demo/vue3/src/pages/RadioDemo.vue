<script setup lang="ts">
import { ref } from 'vue'
import { Radio, RadioGroup, Space, Divider } from '@tigercat/vue'

const gender = ref('male')
const size = ref('medium')
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Radio 单选框</h1>
      <p class="text-gray-600">在一组备选项中进行单选。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">单选框组合使用时，需要通过 RadioGroup 组件进行包裹。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <RadioGroup v-model="gender">
            <Radio value="male">男</Radio>
            <Radio value="female">女</Radio>
            <Radio value="other">其他</Radio>
          </RadioGroup>
          <p class="text-sm text-gray-600">选中的性别：{{ gender }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">单选框不可用的状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <RadioGroup v-model="size">
          <Radio value="small">小</Radio>
          <Radio value="medium">中</Radio>
          <Radio value="large" disabled>大（禁用）</Radio>
        </RadioGroup>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>

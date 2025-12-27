<script setup lang="ts">
import { ref } from 'vue'
import { Select, Space, Divider } from '@tigercat/vue'

const selected = ref('')
const country = ref('china')

const options = [
  { label: '选项 1', value: 'option1' },
  { label: '选项 2', value: 'option2' },
  { label: '选项 3', value: 'option3' },
  { label: '选项 4', value: 'option4' },
]

const countries = [
  { label: '中国', value: 'china' },
  { label: '美国', value: 'usa' },
  { label: '日本', value: 'japan' },
  { label: '英国', value: 'uk' },
  { label: '法国', value: 'france' },
]
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Select 选择器</h1>
      <p class="text-gray-600">当选项过多时，使用下拉菜单展示并选择内容。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">适用广泛的基础选择器。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <Select v-model="selected" :options="options" placeholder="请选择" />
          <p class="text-sm text-gray-600">选中的值：{{ selected || '未选择' }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 有默认值 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">有默认值</h2>
      <p class="text-gray-600 mb-6">可以设置默认选中的值。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <Select v-model="country" :options="countries" />
          <p class="text-sm text-gray-600">选中的国家：{{ country }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">禁用整个选择器组件。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <Select v-model="country" :options="countries" disabled />
        </Space>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>

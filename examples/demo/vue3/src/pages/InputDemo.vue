<script setup lang="ts">
import { ref } from 'vue'
import { Input, Space, Divider, FormItem } from '@tigercat/vue'

const text = ref('')
const password = ref('')
const disabled = ref('禁用的输入框')
const readonly = ref('只读的输入框')
const clearable = ref('可清除的文本')
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Input 输入框</h1>
      <p class="text-gray-600">通过鼠标或键盘输入内容，是最基础的表单域的包装。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">基础的输入框组件。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <Input v-model="text" placeholder="请输入内容" />
          <p class="text-sm text-gray-600">输入的内容：{{ text }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同类型 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同类型</h2>
      <p class="text-gray-600 mb-6">Input 支持多种类型，如文本、密码、数字等。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <FormItem label="文本输入">
            <Input v-model="text" type="text" placeholder="文本输入" />
          </FormItem>
          <FormItem label="密码输入">
            <Input v-model="password" type="password" placeholder="密码输入" />
          </FormItem>
          <FormItem label="数字输入">
            <Input type="number" placeholder="数字输入" />
          </FormItem>
          <FormItem label="邮箱输入">
            <Input type="email" placeholder="邮箱输入" />
          </FormItem>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">输入框有三种尺寸：小、中、大。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <Input size="sm" placeholder="小尺寸输入框" />
          <Input size="md" placeholder="中尺寸输入框" />
          <Input size="lg" placeholder="大尺寸输入框" />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用和只读 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用和只读</h2>
      <p class="text-gray-600 mb-6">输入框可以设置为禁用或只读状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <Input v-model="disabled" disabled />
          <Input v-model="readonly" readonly />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 可清除 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">可清除</h2>
      <p class="text-gray-600 mb-6">使用 clearable 属性使输入框可清除。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <Input v-model="clearable" clearable placeholder="可清除的输入框" />
        </Space>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>

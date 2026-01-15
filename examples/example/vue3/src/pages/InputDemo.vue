<script setup lang="ts">
import { ref } from 'vue'
import { Input, Space, Divider, FormItem } from '@expcat/tigercat-vue'

const basicText = ref('')
const controlledText = ref('')
const typeText = ref('')
const password = ref('')
const disabled = ref('禁用的输入框')
const readonly = ref('只读的输入框')
const limited = ref('')
const uncontrolled = ref('')

const handleUncontrolledInput = (event: Event) => {
  uncontrolled.value = (event.target as HTMLInputElement).value
}
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
          <Input v-model="basicText" placeholder="请输入内容" />
          <p class="text-sm text-gray-600">输入的内容：{{ basicText }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 受控与非受控 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">受控与非受控</h2>
      <p class="text-gray-600 mb-6">
        受控模式绑定值（v-model）；非受控模式不绑定值，仅监听 input 事件。
      </p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <FormItem label="受控输入">
            <Input v-model="controlledText" placeholder="受控输入" />
          </FormItem>
          <FormItem label="非受控输入">
            <Input placeholder="非受控输入" @input="handleUncontrolledInput" />
            <p class="text-sm text-gray-600">输入的内容：{{ uncontrolled }}</p>
          </FormItem>
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
            <Input v-model="typeText" type="text" placeholder="文本输入" />
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

    <!-- 必填与长度限制 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">必填与长度限制</h2>
      <p class="text-gray-600 mb-6">使用 required / minLength / maxLength 约束输入。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <FormItem label="必填输入">
            <Input required placeholder="必填项" />
          </FormItem>
          <FormItem label="长度限制（3~10）">
            <Input
              v-model="limited"
              :minLength="3"
              :maxLength="10"
              placeholder="请输入 3~10 个字符" />
            <p class="text-sm text-gray-600">当前长度：{{ limited.length }}</p>
          </FormItem>
        </Space>
      </div>
    </section>
  </div>
</template>

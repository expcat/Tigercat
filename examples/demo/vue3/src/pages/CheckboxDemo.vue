<script setup lang="ts">
import { ref } from 'vue'
import { Checkbox, CheckboxGroup, Space, Divider } from '@tigercat/vue'

const checked = ref(false)
const disabled = ref(true)
const fruits = ref<string[]>(['apple'])
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Checkbox 多选框</h1>
      <p class="text-gray-600">在一组可选项中进行多项选择。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">单独使用可以表示两种状态之间的切换。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <Checkbox v-model="checked">复选框</Checkbox>
          <p class="text-sm text-gray-600">选中状态：{{ checked }}</p>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">多选框不可用状态。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Checkbox disabled>未选中禁用</Checkbox>
          <Checkbox v-model="disabled" disabled>选中禁用</Checkbox>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 多选框组 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">多选框组</h2>
      <p class="text-gray-600 mb-6">适用于多个勾选框绑定到同一个数组的情景。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <CheckboxGroup v-model="fruits">
            <Checkbox value="apple">苹果</Checkbox>
            <Checkbox value="banana">香蕉</Checkbox>
            <Checkbox value="orange">橙子</Checkbox>
            <Checkbox value="grape">葡萄</Checkbox>
          </CheckboxGroup>
          <p class="text-sm text-gray-600">选中的水果：{{ fruits.join(', ') }}</p>
        </Space>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>

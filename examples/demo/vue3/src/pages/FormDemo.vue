<script setup lang="ts">
import { Form } from '@tigercat/vue'
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
      <p class="text-gray-600 mb-6">基础的 Form 用法。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Form />
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>

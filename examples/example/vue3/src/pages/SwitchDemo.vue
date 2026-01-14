<script setup lang="ts">
import { ref } from 'vue'
import { Switch, Space, Divider } from '@tigercat/vue'

const basicEnabled = ref(true)

const disabledOn = ref(true)
const disabledOff = ref(false)

const sizeSm = ref(false)
const sizeMd = ref(true)
const sizeLg = ref(false)
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Switch 开关</h1>
      <p class="text-gray-600">表示两种相互对立的状态间的切换，多用于触发「开/关」。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">绑定 v-model 到一个 Boolean 类型的变量。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical">
          <div class="flex items-center gap-3">
            <Switch v-model:checked="basicEnabled" />
            <span class="text-sm text-gray-600">{{ basicEnabled ? '开启' : '关闭' }}</span>
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">通过设置 disabled 属性来禁用开关。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space>
          <Switch v-model:checked="disabledOn" disabled />
          <Switch v-model:checked="disabledOff" disabled />
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同尺寸 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同尺寸</h2>
      <p class="text-gray-600 mb-6">开关有三种尺寸。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space align="center">
          <Switch v-model:checked="sizeSm" size="sm" />
          <Switch v-model:checked="sizeMd" size="md" />
          <Switch v-model:checked="sizeLg" size="lg" />
        </Space>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Slider, Space, Divider, Text } from '@tigercat/vue'

const value1 = ref(50)
const value2 = ref(30)
const value3 = ref(75)
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Slider 滑块</h1>
      <p class="text-gray-600">通过拖动滑块在一个固定区间内进行选择。</p>
    </div>

    <!-- 基础用法 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">基础用法</h2>
      <p class="text-gray-600 mb-6">基础的滑块用法，显示当前值。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <div class="flex items-center gap-4">
            <Slider v-model="value1" :min="0" :max="100" class="flex-1" />
            <Text>{{ value1 }}</Text>
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 不同范围 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">不同范围</h2>
      <p class="text-gray-600 mb-6">通过 min 和 max 属性设置范围。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <div>
            <Text class="text-sm text-gray-600 mb-2">0-100 (默认)</Text>
            <div class="flex items-center gap-4">
              <Slider v-model="value1" :min="0" :max="100" class="flex-1" />
              <Text>{{ value1 }}</Text>
            </div>
          </div>
          <div>
            <Text class="text-sm text-gray-600 mb-2">0-200</Text>
            <div class="flex items-center gap-4">
              <Slider v-model="value2" :min="0" :max="200" class="flex-1" />
              <Text>{{ value2 }}</Text>
            </div>
          </div>
        </Space>
      </div>
      <Divider class="my-6" />
    </section>

    <!-- 禁用状态 -->
    <section class="mb-12">
      <h2 class="text-2xl font-bold mb-4">禁用状态</h2>
      <p class="text-gray-600 mb-6">通过 disabled 属性禁用滑块。</p>
      <div class="p-6 bg-gray-50 rounded-lg">
        <Space direction="vertical" class="w-full max-w-md">
          <div class="flex items-center gap-4">
            <Slider v-model="value3" :min="0" :max="100" disabled class="flex-1" />
            <Text>{{ value3 }}</Text>
          </div>
        </Space>
      </div>
    </section>

    <div class="mt-8 p-4 bg-blue-50 rounded-lg">
      <router-link to="/" class="text-blue-600 hover:text-blue-800">← 返回首页</router-link>
    </div>
  </div>
</template>

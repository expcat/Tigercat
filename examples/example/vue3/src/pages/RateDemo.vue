<script setup lang="ts">
import { ref } from 'vue'
import { Rate, Space, Text } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const val1 = ref(3)
const val2 = ref(2.5)
const val3 = ref(4)

const basicSnippet = `<Space direction="vertical" :size="16">
  <Rate v-model="val1" />
  <Rate v-model="val2" allow-half />
  <Text>当前值: {{ val2 }}</Text>
</Space>`

const sizeSnippet = `<Space direction="vertical" :size="12">
  <Rate :model-value="3" size="sm" disabled />
  <Rate :model-value="3" size="md" disabled />
  <Rate :model-value="3" size="lg" disabled />
</Space>`

const customSnippet = `<Space direction="vertical" :size="12">
  <Rate v-model="val3" character="♥" />
  <Rate :model-value="4" :count="10" disabled />
  <Rate :model-value="3" disabled />
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Rate 评分</h1>
    <p class="text-gray-500 mb-8">评分组件，支持半星、自定义字符和禁用状态。</p>

    <DemoBlock title="基本与半星" description="v-model 双向绑定，allow-half 半星" :code="basicSnippet">
      <Space direction="vertical" :size="16">
        <Rate v-model="val1" />
        <Rate v-model="val2" allow-half />
        <Text>当前值: {{ val2 }}</Text>
      </Space>
    </DemoBlock>

    <DemoBlock title="尺寸" description="sm / md / lg 三种尺寸" :code="sizeSnippet">
      <Space direction="vertical" :size="12">
        <Rate :model-value="3" size="sm" disabled />
        <Rate :model-value="3" size="md" disabled />
        <Rate :model-value="3" size="lg" disabled />
      </Space>
    </DemoBlock>

    <DemoBlock title="自定义字符与数量" description="character 自定义图标，count 控制星星数" :code="customSnippet">
      <Space direction="vertical" :size="12">
        <Rate v-model="val3" character="♥" />
        <Rate :model-value="4" :count="10" disabled />
        <Rate :model-value="3" disabled />
      </Space>
    </DemoBlock>
  </div>
</template>

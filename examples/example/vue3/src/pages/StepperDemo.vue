<script setup lang="ts">
import { ref } from 'vue'
import { Stepper, Space, Text } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const val = ref(3)

const basicSnippet = `<Stepper v-model="val" />
<Stepper v-model="val" :min="0" :max="10" :step="2" />
<Text>当前值: {{ val }}</Text>`

const sizeSnippet = `<Space direction="vertical" :size="12">
  <Stepper :model-value="1" size="sm" />
  <Stepper :model-value="1" size="md" />
  <Stepper :model-value="1" size="lg" />
  <Stepper :model-value="1" disabled />
</Space>`

const precisionSnippet = `<Stepper :model-value="1.5" :step="0.1" :precision="2" :min="0" :max="5" />`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Stepper 步进器</h1>
    <p class="text-gray-500 mb-8">数值增减控制器，支持步长、范围和精度。</p>

    <DemoBlock title="基本用法" description="v-model 双向绑定，min/max 范围，step 步长" :code="basicSnippet">
      <Space direction="vertical" :size="12">
        <Stepper v-model="val" />
        <Stepper v-model="val" :min="0" :max="10" :step="2" />
        <Text>当前值: {{ val }}</Text>
      </Space>
    </DemoBlock>

    <DemoBlock title="尺寸与禁用" description="sm/md/lg 三种尺寸，disabled 禁用" :code="sizeSnippet">
      <Space direction="vertical" :size="12">
        <Stepper :model-value="1" size="sm" />
        <Stepper :model-value="1" size="md" />
        <Stepper :model-value="1" size="lg" />
        <Stepper :model-value="1" disabled />
      </Space>
    </DemoBlock>

    <DemoBlock title="小数精度" description="precision 控制小数位数" :code="precisionSnippet">
      <Stepper :model-value="1.5" :step="0.1" :precision="2" :min="0" :max="5" />
    </DemoBlock>
  </div>
</template>

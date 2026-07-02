<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { Switch } from '@expcat/tigercat-vue/Switch'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './SwitchDemo.vue?raw'

const basicEnabled = ref(true)

const disabledOn = ref(true)
const disabledOff = ref(false)

const sizeSm = ref(false)
const sizeMd = ref(true)
const sizeLg = ref(false)

const basicScriptSnippet = `import { ref } from 'vue'

const basicEnabled = ref(true)`

const basicSnippet = `<Space direction="vertical">
  <div class="flex items-center gap-3">
    <Switch v-model="basicEnabled" />
    <span class="text-sm text-gray-600">{{ basicEnabled ? '开启' : '关闭' }}</span>
  </div>
</Space>`

const disabledSnippet = `<Space>
  <Switch v-model="disabledOn" disabled />
  <Switch v-model="disabledOff" disabled />
</Space>`

const sizeSnippet = `<Space align="center">
  <Switch v-model="sizeSm" size="sm" />
  <Switch v-model="sizeMd" size="md" />
  <Switch v-model="sizeLg" size="lg" />
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Switch 开关</h1>
      <p class="text-gray-600 dark:text-gray-400">
        表示两种相互对立的状态间的切换，多用于触发「开/关」。
      </p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock
      title="基础用法"
      description="绑定 v-model 到一个 Boolean 类型的变量。"
      :code="fullPageSnippet">
      <Space direction="vertical">
        <div class="flex items-center gap-3">
          <Switch v-model="basicEnabled" aria-label="开启消息通知" />
          <span class="text-sm text-gray-600">{{ basicEnabled ? '开启' : '关闭' }}</span>
        </div>
      </Space>
    </DemoBlock>

    <!-- 禁用状态 -->
    <DemoBlock
      title="禁用状态"
      description="通过设置 disabled 属性来禁用开关。"
      :code="fullPageSnippet">
      <Space>
        <Switch v-model="disabledOn" disabled aria-label="已开启的禁用开关" />
        <Switch v-model="disabledOff" disabled aria-label="已关闭的禁用开关" />
      </Space>
    </DemoBlock>

    <!-- 不同尺寸 -->
    <DemoBlock title="不同尺寸" description="开关有三种尺寸。" :code="fullPageSnippet">
      <Space align="center">
        <Switch v-model="sizeSm" size="sm" aria-label="小尺寸开关" />
        <Switch v-model="sizeMd" size="md" aria-label="中尺寸开关" />
        <Switch v-model="sizeLg" size="lg" aria-label="大尺寸开关" />
      </Space>
    </DemoBlock>
  </div>
</template>

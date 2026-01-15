<script setup lang="ts">
import { ref } from 'vue'
import { Switch, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const basicEnabled = ref(true)

const disabledOn = ref(true)
const disabledOff = ref(false)

const sizeSm = ref(false)
const sizeMd = ref(true)
const sizeLg = ref(false)

const basicSnippet = `<Space direction="vertical">
  <div class="flex items-center gap-3">
    <Switch v-model:checked="basicEnabled" />
    <span class="text-sm text-gray-600">{{ basicEnabled ? '开启' : '关闭' }}</span>
  </div>
</Space>`

const disabledSnippet = `<Space>
  <Switch v-model:checked="disabledOn" disabled />
  <Switch v-model:checked="disabledOff" disabled />
</Space>`

const sizeSnippet = `<Space align="center">
  <Switch v-model:checked="sizeSm" size="sm" />
  <Switch v-model:checked="sizeMd" size="md" />
  <Switch v-model:checked="sizeLg" size="lg" />
</Space>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold mb-2">Switch 开关</h1>
      <p class="text-gray-600">表示两种相互对立的状态间的切换，多用于触发「开/关」。</p>
    </div>

    <!-- 基础用法 -->
    <DemoBlock title="基础用法"
               description="绑定 v-model 到一个 Boolean 类型的变量。"
               :code="basicSnippet">
      <Space direction="vertical">
        <div class="flex items-center gap-3">
          <Switch v-model:checked="basicEnabled" />
          <span class="text-sm text-gray-600">{{ basicEnabled ? '开启' : '关闭' }}</span>
        </div>
      </Space>
    </DemoBlock>

    <!-- 禁用状态 -->
    <DemoBlock title="禁用状态"
               description="通过设置 disabled 属性来禁用开关。"
               :code="disabledSnippet">
      <Space>
        <Switch v-model:checked="disabledOn"
                disabled />
        <Switch v-model:checked="disabledOff"
                disabled />
      </Space>
    </DemoBlock>

    <!-- 不同尺寸 -->
    <DemoBlock title="不同尺寸"
               description="开关有三种尺寸。"
               :code="sizeSnippet">
      <Space align="center">
        <Switch v-model:checked="sizeSm"
                size="sm" />
        <Switch v-model:checked="sizeMd"
                size="md" />
        <Switch v-model:checked="sizeLg"
                size="lg" />
      </Space>
    </DemoBlock>
  </div>
</template>

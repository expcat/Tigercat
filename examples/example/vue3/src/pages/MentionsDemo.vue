<script setup lang="ts">
import { ref } from 'vue'
import { Mentions, Space } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const val = ref('')
const val2 = ref('')
const users = [
  { label: '张三', value: 'zhangsan' },
  { label: '李四', value: 'lisi' },
  { label: '王五', value: 'wangwu' },
  { label: '赵六', value: 'zhaoliu' }
]

const basicSnippet = `<Mentions v-model="val" :options="users" placeholder="输入 @ 提及用户" />`
const customSnippet = `<Mentions v-model="val" :options="users" prefix="#" placeholder="输入 # 提及话题" />`
const stateSnippet = `<Mentions :options="users" size="sm" placeholder="小尺寸" />
<Mentions :options="users" size="lg" placeholder="大尺寸" />
<Mentions :options="users" disabled placeholder="禁用" />`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Mentions 提及</h1>
    <p class="text-gray-500 mb-8">输入框中 @提及 用户，支持自定义触发字符。</p>

    <DemoBlock title="基本用法" description="输入 @ 触发用户列表" :code="basicSnippet">
      <Mentions v-model="val" :options="users" placeholder="输入 @ 提及用户" />
    </DemoBlock>

    <DemoBlock title="自定义触发符" description="prefix 自定义触发字符" :code="customSnippet">
      <Mentions v-model="val2" :options="users" prefix="#" placeholder="输入 # 提及话题" />
    </DemoBlock>

    <DemoBlock title="尺寸与禁用" :code="stateSnippet">
      <Space direction="vertical" :size="12" class="w-full">
        <Mentions :options="users" size="sm" placeholder="小尺寸" />
        <Mentions :options="users" size="lg" placeholder="大尺寸" />
        <Mentions :options="users" disabled placeholder="禁用" />
      </Space>
    </DemoBlock>
  </div>
</template>

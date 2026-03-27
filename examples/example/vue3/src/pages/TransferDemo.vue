<script setup lang="ts">
import { ref } from 'vue'
import { Transfer } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const targetKeys1 = ref<(string | number)[]>(['3', '4'])
const targetKeys2 = ref<(string | number)[]>(['3', '4'])
const dataSource = Array.from({ length: 10 }, (_, i) => ({
  key: String(i + 1),
  title: `内容 ${i + 1}`,
  description: `描述 ${i + 1}`
}))

const basicSnippet = `<Transfer
  v-model="targetKeys"
  :data-source="dataSource"
/>`

const searchSnippet = `<Transfer
  v-model="targetKeys"
  :data-source="dataSource"
  show-search
  :titles="['可选', '已选']"
/>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">Transfer 穿梭框</h1>
    <p class="text-gray-500 mb-8">双栏穿梭选择，将数据在两栏之间移动。</p>

    <DemoBlock title="基本用法" description="双向穿梭选择" :code="basicSnippet">
      <Transfer v-model="targetKeys1" :data-source="dataSource" />
    </DemoBlock>

    <DemoBlock title="搜索与标题" description="show-search 开启搜索，titles 自定义标题" :code="searchSnippet">
      <Transfer v-model="targetKeys2" :data-source="dataSource" show-search :titles="['可选', '已选']" />
    </DemoBlock>
  </div>
</template>

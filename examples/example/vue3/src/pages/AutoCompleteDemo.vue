<script setup lang="ts">
import { ref } from 'vue'
import { AutoComplete } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const val = ref('')
const val2 = ref('')
const allOptions = ['React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Preact', 'Next.js', 'Nuxt'].map(o => ({ label: o, value: o }))

const basicSnippet = `<AutoComplete
  v-model="val"
  :options="allOptions"
  placeholder="请输入搜索内容"
/>`

const customSnippet = `<AutoComplete
  v-model="val"
  :options="allOptions.map(o => ({ label: o.label + ' 框架', value: o.value }))"
  placeholder="自定义选项"
/>`
</script>

<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">AutoComplete 自动补全</h1>
    <p class="text-gray-500 mb-8">输入框自动完成，根据输入内容过滤候选项。</p>

    <DemoBlock title="基本用法" description="输入时自动过滤匹配选项" :code="basicSnippet">
      <AutoComplete v-model="val" :options="allOptions" placeholder="请输入搜索内容" />
    </DemoBlock>

    <DemoBlock title="自定义选项" description="options 支持 {label, value} 对象" :code="customSnippet">
      <AutoComplete
        v-model="val2"
        :options="allOptions.map(o => ({ label: o.label + ' 框架', value: o.value }))"
        placeholder="自定义选项" />
    </DemoBlock>
  </div>
</template>

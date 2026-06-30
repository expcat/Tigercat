<template>
  <div class="max-w-5xl mx-auto p-4 sm:p-8">
    <h1 class="text-3xl font-bold mb-2">CodeEditor 代码编辑器</h1>
    <p class="text-gray-500 mb-8">轻量级代码编辑器，支持语法高亮、行号和主题切换。</p>

    <DemoBlock
      title="组合展示"
      description="合并展示基础用法、主题 & 只读、配置项，减少重复示例块。"
      :code="fullPageSnippet">
      <div class="space-y-6">
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">基础用法</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            language 设置语言，v-model 绑定代码
          </p>
          <CodeEditor v-model:value="jsCode" language="javascript" :min-lines="5" />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">主题 & 只读</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">theme='dark'，readOnly</p>
          <CodeEditor :value="htmlCode" language="html" theme="dark" read-only :min-lines="5" />
        </section>
        <section class="space-y-3">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200">配置项</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">tabSize、wordWrap、placeholder</p>
          <CodeEditor
            language="css"
            :tab-size="4"
            word-wrap
            placeholder="输入 CSS 代码..."
            :min-lines="4"
            :max-lines="10" />
        </section>
      </div>
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@expcat/tigercat-vue/CodeEditor'
import DemoBlock from '../components/DemoBlock.vue'
import fullPageSnippet from './CodeEditorDemo.fixture.vue?raw'

const jsCode = ref(`function greet(name) {
  console.log('Hello, ' + name)
}

greet('Tigercat')`)

const htmlCode = `<div class="container">
  <h1>Hello World</h1>
  <p>This is read-only.</p>
</div>`
</script>

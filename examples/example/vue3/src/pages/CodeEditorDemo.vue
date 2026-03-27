<template>
  <div class="max-w-5xl mx-auto p-8">
    <h1 class="text-3xl font-bold mb-2">CodeEditor 代码编辑器</h1>
    <p class="text-gray-500 mb-8">轻量级代码编辑器，支持语法高亮、行号和主题切换。</p>

    <DemoBlock title="基础用法" description="language 设置语言，v-model 绑定代码" :code="basicSnippet">
      <CodeEditor v-model:value="jsCode" language="javascript" :min-lines="5" />
    </DemoBlock>

    <DemoBlock title="主题 & 只读" description="theme='dark'，readOnly" :code="themeSnippet">
      <CodeEditor :value="htmlCode" language="html" theme="dark" read-only :min-lines="5" />
    </DemoBlock>

    <DemoBlock title="配置项" description="tabSize、wordWrap、placeholder" :code="configSnippet">
      <CodeEditor
        language="css"
        :tab-size="4"
        word-wrap
        placeholder="输入 CSS 代码..."
        :min-lines="4"
        :max-lines="10" />
    </DemoBlock>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CodeEditor } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const jsCode = ref(`function greet(name) {
  console.log('Hello, ' + name)
}

greet('Tigercat')`)

const htmlCode = `<div class="container">
  <h1>Hello World</h1>
  <p>This is read-only.</p>
</div>`

const basicSnippet = `<CodeEditor v-model:value="code" language="javascript" :min-lines="5" />`

const themeSnippet = `<CodeEditor :value="code" language="html" theme="dark" read-only :min-lines="5" />`

const configSnippet = `<CodeEditor
  language="css" :tab-size="4" word-wrap
  placeholder="输入 CSS 代码..." :min-lines="4" :max-lines="10" />`
</script>

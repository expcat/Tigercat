<script setup lang="ts">
import { ref } from 'vue'
import { Code } from '@expcat/tigercat-vue'
import DemoBlock from '../components/DemoBlock.vue'

const installSnippet = 'pnpm add @expcat/tigercat-vue'
const usageSnippet = [
    "import { Code } from '@expcat/tigercat-vue'",
    '',
    "<Code :code=\"const a = 1\" />"
].join('\n')
const themeSnippet = `:root {
  --tiger-primary: #2563eb;
}`

const lastCopied = ref('')
const handleCopy = (code: string) => {
    lastCopied.value = code
}

const basicDemoSnippet = '<Code :code="installSnippet" />'
const customLabelSnippet = '<Code :code="usageSnippet" copy-label="复制代码" copied-label="已复制" />'
const disabledSnippet = '<Code :code="themeSnippet" :copyable="false" />'
const eventSnippet = '<Code :code="installSnippet" @copy="handleCopy" />'
</script>

<template>
    <div class="max-w-5xl mx-auto p-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">Code 代码展示</h1>
            <p class="text-gray-600">展示代码片段并支持一键复制。</p>
        </div>

        <DemoBlock title="基础用法" description="展示代码内容与默认复制按钮。" :code="basicDemoSnippet">
            <Code :code="installSnippet" />
        </DemoBlock>

        <DemoBlock title="自定义按钮文案" description="通过 copy-label / copied-label 自定义按钮文案。" :code="customLabelSnippet">
            <Code :code="usageSnippet" copy-label="复制代码" copied-label="已复制" />
        </DemoBlock>

        <DemoBlock title="禁用复制" description="关闭 copyable 不显示复制按钮。" :code="disabledSnippet">
            <Code :code="themeSnippet" :copyable="false" />
        </DemoBlock>

        <DemoBlock title="复制事件回调" description="通过 @copy 监听复制事件，获取被复制的代码内容。" :code="eventSnippet">
            <Code :code="installSnippet" @copy="handleCopy" />
            <p v-if="lastCopied" class="mt-2 text-sm text-gray-500">上次复制: {{ lastCopied }}</p>
        </DemoBlock>
    </div>
</template>

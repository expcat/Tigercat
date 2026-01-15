<script setup lang="ts">
import { Code, Divider, Space } from '@expcat/tigercat-vue'

const installSnippet = 'pnpm add @expcat/tigercat-vue'
const usageSnippet = [
    "import { Code } from '@expcat/tigercat-vue'",
    '',
    "<Code :code=\"const a = 1\" />"
].join('\n')
const themeSnippet = `:root {
  --tiger-primary: #2563eb;
}`
</script>

<template>
    <div class="max-w-5xl mx-auto p-8">
        <div class="mb-8">
            <h1 class="text-3xl font-bold mb-2">Code 代码展示</h1>
            <p class="text-gray-600">展示代码片段并支持一键复制。</p>
        </div>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4">基础用法</h2>
            <p class="text-gray-600 mb-6">展示代码内容与默认复制按钮。</p>
            <div class="p-6 bg-gray-50 rounded-lg">
                <Code :code="installSnippet" />
            </div>
            <Divider class="my-6" />
        </section>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4">自定义按钮文案</h2>
            <p class="text-gray-600 mb-6">通过 copy-label / copied-label 自定义按钮文案。</p>
            <div class="p-6 bg-gray-50 rounded-lg">
                <Code :code="usageSnippet"
                      copy-label="复制代码"
                      copied-label="已复制" />
            </div>
            <Divider class="my-6" />
        </section>

        <section class="mb-12">
            <h2 class="text-2xl font-bold mb-4">禁用复制</h2>
            <p class="text-gray-600 mb-6">关闭 copyable 不显示复制按钮。</p>
            <div class="p-6 bg-gray-50 rounded-lg">
                <Space direction="vertical"
                       class="w-full">
                    <Code :code="themeSnippet"
                          :copyable="false" />
                </Space>
            </div>
        </section>
    </div>
</template>

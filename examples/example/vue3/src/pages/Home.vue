<script setup lang="ts">
const installSnippet = 'pnpm add @expcat/tigercat-vue'
const scriptClose = '</scr' + 'ipt>'

const usageSnippet = [
  '<script setup lang="ts">',
  "import { Button, ConfigProvider } from '@expcat/tigercat-vue'",
  scriptClose,
  '',
  '<template>',
  '  <ConfigProvider>',
  '    <Button variant="solid">开始使用</Button>',
  '  </ConfigProvider>',
  '</template>'
].join('\n')

const themeSnippet = `:root {
  --tiger-primary: #2563eb;
  --tiger-primary-hover: #1d4ed8;
}`
</script>

<template>
  <div class="max-w-5xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
        如何在项目中使用 Tigercat（Vue 3）
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">按照下面的步骤安装并使用组件库。</p>
    </div>

    <div class="mt-6 space-y-6">
      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">1. 安装</h2>
        <pre
             class="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100"><code v-text="installSnippet"></code></pre>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">2. 组件使用</h2>
        <pre
             class="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100"><code v-text="usageSnippet"></code></pre>
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">3. 主题色（可选）</h2>
        <pre
             class="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-100"><code v-text="themeSnippet"></code></pre>
      </section>
    </div>
  </div>
</template>

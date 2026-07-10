<script setup lang="ts">
import { Code } from '@expcat/tigercat-vue/Code'

const installSnippet = 'pnpm add @expcat/tigercat-vue @expcat/tigercat-core'
const scriptClose = '</scr' + 'ipt>'

const cssSnippet = `@import 'tailwindcss';
@plugin '@expcat/tigercat-core/tailwind/modern';
@source '../node_modules/@expcat/tigercat-vue/dist/**/*.{js,mjs}';
@source '../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}';`

const usageSnippet = [
  '<script setup lang="ts">',
  "import { Button } from '@expcat/tigercat-vue/Button'",
  "import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'",
  scriptClose,
  '',
  '<template>',
  '  <ConfigProvider>',
  '    <Button variant="primary">开始使用</Button>',
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

    <div class="mb-6">
      <div
        class="rounded-lg border border-(--tiger-primary,#2563eb)/40 bg-(--tiger-primary,#2563eb)/5 p-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-base">🟢</span>
          <span class="text-sm font-semibold text-(--tiger-primary,#2563eb)">当前框架 · Vue 3</span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          基于 <code>@expcat/tigercat-vue</code>，与 Vue 3.5 + ConfigProvider 深度集成。
        </p>
      </div>
    </div>

    <div class="mt-6 space-y-6">
      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">1. 安装</h2>
        <Code class="mt-3" :code="installSnippet" />
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          2. 配置 Tailwind v4 CSS
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          在项目的 CSS 入口中加载 Tailwind、Tigercat 插件与组件扫描路径：
        </p>
        <Code class="mt-3" :code="cssSnippet" />
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">3. 组件使用</h2>

        <Code class="mt-3" :code="usageSnippet" />
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">4. 主题色（可选）</h2>
        <Code class="mt-3" :code="themeSnippet" />
      </section>
    </div>
  </div>
</template>

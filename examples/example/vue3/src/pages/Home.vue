<script setup lang="ts">
import { Code } from '@expcat/tigercat-vue'

const CROSS_FRAMEWORK_URL = import.meta.env.DEV ? '/' : '../react/'

const installSnippet = 'pnpm add @expcat/tigercat-vue @expcat/tigercat-core'
const scriptClose = '</scr' + 'ipt>'

const configSnippet = `// tailwind.config.js
import { tigercatPlugin } from '@expcat/tigercat-core'

export default {
  content: [
    // ...
    './node_modules/@expcat/tigercat-*/dist/**/*.{js,mjs}'
  ],
  plugins: [
    tigercatPlugin
  ]
}`

const cssSnippet = `@import 'tailwindcss';
@source '../node_modules/@expcat/tigercat-vue/dist/**/*.{js,mjs}';
@source '../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}';`

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

    <div class="mb-6 grid gap-3 sm:grid-cols-2">
      <div class="rounded-lg border border-[var(--tiger-primary,#2563eb)]/40 bg-[var(--tiger-primary,#2563eb)]/5 p-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-base">🟢</span>
          <span class="text-sm font-semibold text-[var(--tiger-primary,#2563eb)]">当前框架 · Vue 3</span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          基于 <code>@expcat/tigercat-vue</code>，与 Vue 3.5 + ConfigProvider 深度集成。
        </p>
      </div>
      <a
        :href="CROSS_FRAMEWORK_URL"
        class="rounded-lg border border-gray-200 p-4 transition-colors hover:border-[var(--tiger-primary,#2563eb)] hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-base">⚛️</span>
          <span class="text-sm font-semibold text-gray-900 dark:text-gray-100">React 同款 →</span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          访问 <code>@expcat/tigercat-react</code> 的等价示例，对比同名组件 API。
        </p>
      </a>
    </div>

    <div class="mt-6 space-y-6">
      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">1. 安装</h2>
        <Code class="mt-3"
              :code="installSnippet" />
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">2. 配置 Tailwind</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          在 <code>tailwind.config.js</code> 中添加插件与扫描路径：
        </p>
        <Code class="mt-3"
              :code="configSnippet" />
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">3. 引入样式入口</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          在项目的 CSS 文件中加入以下内容（放在业务样式之前）：
        </p>
        <Code class="mt-3"
              :code="cssSnippet" />
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">4. 组件使用</h2>

        <Code class="mt-3"
              :code="usageSnippet" />
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">5. 主题色（可选）</h2>
        <Code class="mt-3"
              :code="themeSnippet" />
      </section>
    </div>
  </div>
</template>

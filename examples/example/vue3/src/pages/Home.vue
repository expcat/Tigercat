<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue'
import { Code } from '@expcat/tigercat-vue/Code'
import type { DemoLang } from '@demo-shared/app-config'
import { demoChrome } from '@demo-shared/chrome'

const demoLang = inject<Ref<DemoLang>>('demo-lang', ref<DemoLang>('zh-CN'))
const chrome = computed(() => demoChrome(demoLang.value))
const scriptClose = '</scr' + 'ipt>'

const installSnippet = 'pnpm add @expcat/tigercat-vue @expcat/tigercat-core'
const cssSnippet = `@import 'tailwindcss';
@plugin '@expcat/tigercat-core/tailwind';
@source '../node_modules/@expcat/tigercat-vue/dist/**/*.{js,mjs}';
@source '../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}';`

const usageSnippet = computed(() =>
  [
    '<script setup lang="ts">',
    "import { Button } from '@expcat/tigercat-vue/Button'",
    "import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'",
    scriptClose,
    '',
    '<template>',
    '  <ConfigProvider theme="default" color-scheme="light">',
    `    <Button variant="primary">${chrome.value.homeStart}</Button>`,
    '  </ConfigProvider>',
    '</template>'
  ].join('\n')
)

const themeSnippet = `<ConfigProvider theme="natural" color-scheme="light">
  <App />
</ConfigProvider>`
</script>

<template>
  <div class="max-w-5xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
        {{ chrome.homeTitle }}（Vue 3）
      </h1>
      <p class="mt-2 text-gray-600 dark:text-gray-300">{{ chrome.homeLead }}</p>
    </div>

    <div class="mb-6">
      <div
        class="rounded-lg border border-(--tiger-primary,#2563eb)/40 bg-(--tiger-primary,#2563eb)/5 p-4">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-base">🟢</span>
          <span class="text-sm font-semibold text-(--tiger-primary,#2563eb)">
            {{ chrome.homeFramework }} · Vue 3
          </span>
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-300">
          @expcat/tigercat-vue · {{ chrome.homeFrameworkLead }}
        </p>
      </div>
    </div>

    <div class="mt-6 space-y-6">
      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ chrome.homeInstall }}
        </h2>
        <Code class="mt-3" :code="installSnippet" />
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ chrome.homeCss }}</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">{{ chrome.homeCssLead }}</p>
        <Code class="mt-3" :code="cssSnippet" />
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ chrome.homeUsage }}
        </h2>
        <Code class="mt-3" :code="usageSnippet" />
      </section>

      <section>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {{ chrome.homeTheme }}
        </h2>
        <Code class="mt-3" :code="themeSnippet" />
      </section>
    </div>
  </div>
</template>

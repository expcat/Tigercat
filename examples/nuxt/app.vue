<script setup lang="ts">
import { BarChart } from '@expcat/tigercat-vue/BarChart'
import { Button } from '@expcat/tigercat-vue/Button'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { DatePicker } from '@expcat/tigercat-vue/DatePicker'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'

const selectedDate = '2024-01-15'
const chartData = [
  { x: 'Vue SSR', y: 18 },
  { x: 'Hydration', y: 24 },
  { x: 'Nuxt', y: 16 }
]

useHead({
  htmlAttrs: {
    lang: 'zh-CN',
    dir: 'ltr'
  }
})
</script>

<template>
  <ConfigProvider :locale="zhCN" color-scheme="light">
    <main class="ssr-shell">
      <section class="ssr-panel">
        <p class="eyebrow">Nuxt 3 SSR</p>
        <h1>Tigercat Vue SSR smoke page</h1>
        <p class="copy">
          This page renders Tigercat Vue components during Nuxt SSR and then hydrates the same
          component tree on the client. DatePicker is closed: the smoke covers the formatted input
          (2024-01-15 with format yyyy-MM-dd), not an open calendar. Locale comes from the root
          ConfigProvider object. An unbound default DatePicker calls <code>new Date()</code> during
          render.
        </p>
        <div class="toolbar">
          <Button variant="primary">保存</Button>
          <DatePicker
            :model-value="selectedDate"
            format="yyyy-MM-dd"
            @update:model-value="() => undefined" />
        </div>
      </section>

      <section class="ssr-panel">
        <BarChart
          :data="chartData"
          :width="420"
          :height="240"
          title="Nuxt SSR chart"
          desc="Bar chart rendered through Nuxt SSR"
          gradient />
      </section>
    </main>
  </ConfigProvider>
</template>

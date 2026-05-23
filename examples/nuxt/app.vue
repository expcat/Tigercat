<script setup lang="ts">
import { BarChart, Button, ConfigProvider, DatePicker } from '@expcat/tigercat-vue'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'

const selectedDate = new Date(2024, 0, 15)
const chartData = [
  { x: 'Vue SSR', y: 18 },
  { x: 'Hydration', y: 24 },
  { x: 'Nuxt', y: 16 }
]
</script>

<template>
  <ConfigProvider :locale="zhCN">
    <main class="ssr-shell">
      <section class="ssr-panel">
        <p class="eyebrow">Nuxt 3 SSR</p>
        <h1>Tigercat Vue SSR smoke page</h1>
        <p class="copy">
          This page renders Tigercat Vue components during Nuxt SSR and then hydrates the same
          component tree on the client.
        </p>
        <div class="toolbar">
          <Button variant="primary">保存</Button>
          <DatePicker :model-value="selectedDate" locale="zh-CN" />
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

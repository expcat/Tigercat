<script setup lang="ts">
import { ref } from 'vue'
import type { ColorScheme, TigerLocale, TigerLocaleDirection } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-vue/Button'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Empty } from '@expcat/tigercat-vue/Empty'
import { Segmented } from '@expcat/tigercat-vue/Segmented'

type DemoLanguage = 'zh-CN' | 'en-US'

const locales: Record<DemoLanguage, Partial<TigerLocale>> = {
  'zh-CN': {
    locale: 'zh-CN',
    empty: { noResults: '当前配置下没有匹配结果' }
  },
  'en-US': {
    locale: 'en-US',
    empty: { noResults: 'No matching results for this configuration' }
  }
}

const language = ref<DemoLanguage>('zh-CN')
const theme = ref('vibrant')
const colorScheme = ref<ColorScheme>('light')
const direction = ref<TigerLocaleDirection>('ltr')
const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]
const themeOptions = [
  { label: '活力', value: 'vibrant' },
  { label: '极简', value: 'minimal' }
]
const colorSchemeOptions = [
  { label: '亮色', value: 'light' },
  { label: '暗色', value: 'dark' }
]
const directionOptions = [
  { label: 'LTR', value: 'ltr' },
  { label: 'RTL', value: 'rtl' }
]
</script>

<template>
  <ConfigProvider
    :locale="locales[language]"
    :theme="theme"
    :color-scheme="colorScheme"
    :direction="direction">
    <div style="display: grid; gap: 16px; max-width: 560px">
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">
        <div style="display: grid; gap: 6px">
          <span>语言</span>
          <Segmented
            v-model="language"
            :options="languageOptions"
            size="sm"
            block
            aria-label="语言" />
        </div>
        <div style="display: grid; gap: 6px">
          <span>主题</span>
          <Segmented v-model="theme" :options="themeOptions" size="sm" block aria-label="主题" />
        </div>
        <div style="display: grid; gap: 6px">
          <span>配色</span>
          <Segmented
            v-model="colorScheme"
            :options="colorSchemeOptions"
            size="sm"
            block
            aria-label="配色" />
        </div>
        <div style="display: grid; gap: 6px">
          <span>方向</span>
          <Segmented
            v-model="direction"
            :options="directionOptions"
            size="sm"
            block
            aria-label="方向" />
        </div>
      </div>

      <section
        :dir="direction"
        style="
          padding: 16px;
          border: 1px solid var(--tiger-border, #e5e7eb);
          border-radius: var(--tiger-radius-lg, 12px);
          background: var(--tiger-surface, #fff);
        ">
        <Button variant="primary">
          {{ language === 'zh-CN' ? '当前主题按钮' : 'Current theme button' }}
        </Button>
        <Empty preset="no-results" :show-image="false" />
      </section>
    </div>
  </ConfigProvider>
</template>

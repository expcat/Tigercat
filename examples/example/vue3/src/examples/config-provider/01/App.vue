<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { ThemeManager, type ColorScheme, type TigerLocaleDirection } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-vue/Button'
import { ConfigProvider, useTigerConfig } from '@expcat/tigercat-vue/ConfigProvider'
import { Empty } from '@expcat/tigercat-vue/Empty'
import { Segmented } from '@expcat/tigercat-vue/Segmented'

type DemoLanguage = 'zh-CN' | 'en-US'

const packs = {
  'zh-CN': zhCN,
  'en-US': enUS
} as const

const emptyOverlay = {
  'zh-CN': { empty: { noResults: '当前配置下没有匹配结果' } },
  'en-US': { empty: { noResults: 'No matching results for this configuration' } }
} as const

const chrome = {
  'zh-CN': {
    language: '语言',
    theme: '主题',
    scheme: '配色',
    direction: '方向',
    nestedOn: '嵌套 inner=minimal',
    nestedOff: '卸掉内层',
    button: '当前主题按钮',
    contextTheme: '树内 theme',
    documentTheme: 'document theme',
    caption:
      '应用根上只挂一个 ConfigProvider。theme / colorScheme / direction / lang 写的是 document（本 iframe 的 html），不是这块预览盒。内层只改 context。colorScheme=auto 首屏当 light。'
  },
  'en-US': {
    language: 'Language',
    theme: 'Theme',
    scheme: 'Color scheme',
    direction: 'Direction',
    nestedOn: 'Nest inner=minimal',
    nestedOff: 'Remove inner',
    button: 'Current theme button',
    contextTheme: 'tree theme',
    documentTheme: 'document theme',
    caption:
      'Mount one ConfigProvider at the app root. theme / colorScheme / direction / lang write the document (this iframe html), not this preview box. Nested providers only change context. colorScheme=auto is light on first paint.'
  }
} as const

const ThemeProbe = defineComponent({
  name: 'ThemeProbe',
  props: {
    contextLabel: { type: String, required: true },
    documentLabel: { type: String, required: true }
  },
  setup(props) {
    const config = useTigerConfig()
    const documentTheme = computed(() => ThemeManager.getCurrentTheme())
    return () =>
      h(
        'p',
        { style: 'margin: 0; font-size: 13px' },
        `${props.contextLabel}: ${config.value.theme ?? '—'} · ${props.documentLabel}: ${documentTheme.value}`
      )
  }
})

const Preview = defineComponent({
  name: 'ConfigPreview',
  props: {
    copy: { type: Object as () => (typeof chrome)[DemoLanguage], required: true }
  },
  setup(props) {
    return () =>
      h(
        'section',
        {
          style:
            'display: grid; gap: 12px; padding: 16px; border: 1px solid var(--tiger-border, #e5e7eb); border-radius: var(--tiger-radius-lg, 12px); background: var(--tiger-surface, #fff)'
        },
        [
          h(ThemeProbe, {
            contextLabel: props.copy.contextTheme,
            documentLabel: props.copy.documentTheme
          }),
          h(Button, { variant: 'primary' }, () => props.copy.button),
          h(ConfigProvider, { locale: emptyOverlay[language.value] }, () =>
            h(Empty, { preset: 'no-results', showImage: false })
          )
        ]
      )
  }
})

const language = ref<DemoLanguage>('zh-CN')
const theme = ref('vibrant')
const colorScheme = ref<ColorScheme>('light')
const direction = ref<TigerLocaleDirection>('ltr')
const nested = ref(true)
const copy = computed(() => chrome[language.value])
const locale = computed(() => packs[language.value])

const languageOptions = [
  { label: '中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]
const themeOptions = [
  { label: 'default', value: 'default' },
  { label: 'modern', value: 'modern' },
  { label: 'vibrant', value: 'vibrant' },
  { label: 'minimal', value: 'minimal' }
]
const colorSchemeOptions = [
  { label: 'light', value: 'light' },
  { label: 'dark', value: 'dark' },
  { label: 'auto', value: 'auto' }
]
const directionOptions = [
  { label: 'LTR', value: 'ltr' },
  { label: 'RTL', value: 'rtl' }
]
</script>

<template>
  <ConfigProvider
    :locale="locale"
    :theme="theme"
    :color-scheme="colorScheme"
    :direction="direction">
    <div style="display: grid; gap: 16px; max-width: 560px">
      <p style="margin: 0; font-size: 13px; color: var(--tiger-text-secondary)">
        {{ copy.caption }}
      </p>
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px">
        <div style="display: grid; gap: 6px">
          <span>{{ copy.language }}</span>
          <Segmented
            v-model="language"
            :options="languageOptions"
            size="sm"
            block
            :aria-label="copy.language" />
        </div>
        <div style="display: grid; gap: 6px">
          <span>{{ copy.theme }}</span>
          <Segmented
            v-model="theme"
            :options="themeOptions"
            size="sm"
            block
            :aria-label="copy.theme" />
        </div>
        <div style="display: grid; gap: 6px">
          <span>{{ copy.scheme }}</span>
          <Segmented
            v-model="colorScheme"
            :options="colorSchemeOptions"
            size="sm"
            block
            :aria-label="copy.scheme" />
        </div>
        <div style="display: grid; gap: 6px">
          <span>{{ copy.direction }}</span>
          <Segmented
            v-model="direction"
            :options="directionOptions"
            size="sm"
            block
            :aria-label="copy.direction" />
        </div>
      </div>
      <Button variant="outline" size="sm" @click="nested = !nested">
        {{ nested ? copy.nestedOff : copy.nestedOn }}
      </Button>
      <ConfigProvider v-if="nested" theme="minimal">
        <Preview :copy="copy" />
      </ConfigProvider>
      <Preview v-else :copy="copy" />
    </div>
  </ConfigProvider>
</template>

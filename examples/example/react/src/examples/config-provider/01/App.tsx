import { useState } from 'react'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { ThemeManager, type ColorScheme, type TigerLocaleDirection } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-react/Button'
import { ConfigProvider, useTigerConfig } from '@expcat/tigercat-react/ConfigProvider'
import { Empty } from '@expcat/tigercat-react/Empty'
import { Segmented } from '@expcat/tigercat-react/Segmented'

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

function Probe({ copy }: { copy: (typeof chrome)[DemoLanguage] }) {
  const config = useTigerConfig()
  return (
    <p style={{ margin: 0, fontSize: 13 }}>
      {copy.contextTheme}: {config.theme ?? '—'} · {copy.documentTheme}:{' '}
      {ThemeManager.getCurrentTheme()}
    </p>
  )
}

export default function ConfigProviderExample() {
  const [language, setLanguage] = useState<DemoLanguage>('zh-CN')
  const [theme, setTheme] = useState('vibrant')
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light')
  const [direction, setDirection] = useState<TigerLocaleDirection>('ltr')
  const [nested, setNested] = useState(true)
  const copy = chrome[language]

  const preview = (
    <section
      style={{
        display: 'grid',
        gap: 12,
        padding: 16,
        border: '1px solid var(--tiger-border, #e5e7eb)',
        borderRadius: 'var(--tiger-radius-lg, 12px)',
        background: 'var(--tiger-surface, #fff)'
      }}>
      <Probe copy={copy} />
      <Button variant="primary">{copy.button}</Button>
      <ConfigProvider locale={emptyOverlay[language]}>
        <Empty preset="no-results" showImage={false} />
      </ConfigProvider>
    </section>
  )

  return (
    <ConfigProvider
      locale={packs[language]}
      theme={theme}
      colorScheme={colorScheme}
      direction={direction}>
      <div style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--tiger-text-secondary)' }}>
          {copy.caption}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <span>{copy.language}</span>
            <Segmented
              aria-label={copy.language}
              value={language}
              options={languageOptions}
              size="sm"
              block
              onChange={(value) => setLanguage(String(value) as DemoLanguage)}
            />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <span>{copy.theme}</span>
            <Segmented
              aria-label={copy.theme}
              value={theme}
              options={themeOptions}
              size="sm"
              block
              onChange={(value) => setTheme(String(value))}
            />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <span>{copy.scheme}</span>
            <Segmented
              aria-label={copy.scheme}
              value={colorScheme}
              options={colorSchemeOptions}
              size="sm"
              block
              onChange={(value) => setColorScheme(String(value) as ColorScheme)}
            />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <span>{copy.direction}</span>
            <Segmented
              aria-label={copy.direction}
              value={direction}
              options={directionOptions}
              size="sm"
              block
              onChange={(value) => setDirection(String(value) as TigerLocaleDirection)}
            />
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setNested((value) => !value)}>
          {nested ? copy.nestedOff : copy.nestedOn}
        </Button>
        {nested ? <ConfigProvider theme="minimal">{preview}</ConfigProvider> : preview}
      </div>
    </ConfigProvider>
  )
}

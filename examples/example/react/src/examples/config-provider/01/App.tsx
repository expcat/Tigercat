import { useState } from 'react'
import type { ColorScheme, TigerLocale, TigerLocaleDirection } from '@expcat/tigercat-core'
import { Button } from '@expcat/tigercat-react/Button'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Empty } from '@expcat/tigercat-react/Empty'
import { Segmented } from '@expcat/tigercat-react/Segmented'

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

export default function ConfigProviderExample() {
  const [language, setLanguage] = useState<DemoLanguage>('zh-CN')
  const [theme, setTheme] = useState('vibrant')
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light')
  const [direction, setDirection] = useState<TigerLocaleDirection>('ltr')

  return (
    <ConfigProvider
      locale={locales[language]}
      theme={theme}
      colorScheme={colorScheme}
      direction={direction}>
      <div style={{ display: 'grid', gap: 16, maxWidth: 560 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
          <div style={{ display: 'grid', gap: 6 }}>
            <span>语言</span>
            <Segmented
              aria-label="语言"
              value={language}
              options={languageOptions}
              size="sm"
              block
              onChange={(value) => setLanguage(String(value) as DemoLanguage)}
            />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <span>主题</span>
            <Segmented
              aria-label="主题"
              value={theme}
              options={themeOptions}
              size="sm"
              block
              onChange={(value) => setTheme(String(value))}
            />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <span>配色</span>
            <Segmented
              aria-label="配色"
              value={colorScheme}
              options={colorSchemeOptions}
              size="sm"
              block
              onChange={(value) => setColorScheme(String(value) as ColorScheme)}
            />
          </div>
          <div style={{ display: 'grid', gap: 6 }}>
            <span>方向</span>
            <Segmented
              aria-label="方向"
              value={direction}
              options={directionOptions}
              size="sm"
              block
              onChange={(value) => setDirection(String(value) as TigerLocaleDirection)}
            />
          </div>
        </div>

        <section
          dir={direction}
          style={{
            padding: 16,
            border: '1px solid var(--tiger-border, #e5e7eb)',
            borderRadius: 'var(--tiger-radius-lg, 12px)',
            background: 'var(--tiger-surface, #fff)'
          }}>
          <Button variant="primary">
            {language === 'zh-CN' ? '当前主题按钮' : 'Current theme button'}
          </Button>
          <Empty preset="no-results" showImage={false} />
        </section>
      </div>
    </ConfigProvider>
  )
}

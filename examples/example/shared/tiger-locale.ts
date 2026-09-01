import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import type { TigerLocale } from '@expcat/tigercat-core'
import type { DemoLang } from './app-config'

export function getDemoTigerLocale(lang: DemoLang): TigerLocale {
  return lang === 'zh-CN' ? zhCN : enUS
}

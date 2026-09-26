import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import type { TigerLocale } from '@expcat/tigercat-core'
import type { DemoLang } from './app-config'

/** Top-bar language → the official locale object demos inherit. */
export function getDemoTigerLocale(lang: DemoLang): TigerLocale {
  if (lang === 'zh-CN') return zhCN
  if (lang === 'zh-TW') return zhTW
  return enUS
}

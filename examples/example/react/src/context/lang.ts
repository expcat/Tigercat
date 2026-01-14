import React from 'react'
import type { DemoLang } from '@demo-shared/app-config'

export interface LangContextValue {
  lang: DemoLang
}

export const LangContext = React.createContext<LangContextValue>({
  lang: 'zh-CN'
})

export function useLang(): LangContextValue {
  return React.useContext(LangContext)
}

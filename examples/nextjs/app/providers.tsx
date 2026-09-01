'use client'

import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'

export function TigercatProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider locale={zhCN} colorScheme="light">
      {children}
    </ConfigProvider>
  )
}

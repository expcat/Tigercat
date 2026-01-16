import React, { useEffect, useState } from 'react'
import { Select } from '@expcat/tigercat-react'
import { themes, applyTheme } from '@demo-shared/themes'
import { getStoredTheme, setStoredTheme } from '@demo-shared/prefs'
import type { DemoLang } from '@demo-shared/app-config'

export interface ThemeSwitchProps {
  lang?: DemoLang
}

const themeNameByValue: Record<string, Record<DemoLang, string>> = {
  default: { 'zh-CN': '默认蓝色', 'en-US': 'Default Blue' },
  green: { 'zh-CN': '绿色主题', 'en-US': 'Green' },
  purple: { 'zh-CN': '紫色主题', 'en-US': 'Purple' },
  orange: { 'zh-CN': '橙色主题', 'en-US': 'Orange' },
  pink: { 'zh-CN': '粉色主题', 'en-US': 'Pink' }
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ lang = 'zh-CN' }) => {
  const [currentTheme, setCurrentTheme] = useState(() => getStoredTheme())

  useEffect(() => {
    applyTheme(currentTheme)
  }, [])

  const handleThemeChange = (value: string | number | (string | number)[] | undefined) => {
    const themeValue = String(value)
    setCurrentTheme(themeValue)
    setStoredTheme(themeValue)
    applyTheme(themeValue)
  }

  const themeOptions = themes.map((t) => ({
    label: themeNameByValue[t.value]?.[lang] ?? t.name,
    value: t.value
  }))

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0 dark:text-gray-200">
        {lang === 'zh-CN' ? '主题：' : 'Theme:'}
      </span>
      <Select
        value={currentTheme}
        onChange={handleThemeChange}
        options={themeOptions}
        size="sm"
        className="w-40 max-w-full"
      />
    </div>
  )
}

export default ThemeSwitch

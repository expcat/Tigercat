import React from 'react'
import { Select } from '@expcat/tigercat-react/Select'
import { DEMO_THEME_PRESETS } from '@demo-shared/themes'
import type { DemoLang } from '@demo-shared/app-config'

export interface ThemeSwitchProps {
  lang?: DemoLang
  value: string
  onChange: (theme: string) => void
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ lang = 'zh-CN', value, onChange }) => {
  const handleThemeChange = (next: string | number | (string | number)[] | undefined) => {
    const themeValue = String(Array.isArray(next) ? next[0] : next)
    if (themeValue) onChange(themeValue)
  }

  const themeOptions = DEMO_THEME_PRESETS.map((preset) => ({
    label: preset.label[lang],
    value: preset.value
  }))

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0 dark:text-gray-200">
        {lang === 'zh-CN' ? '主题：' : 'Theme:'}
      </span>
      <Select
        value={value}
        onChange={handleThemeChange}
        options={themeOptions}
        size="sm"
        className="w-40 max-w-full"
      />
    </div>
  )
}

export default ThemeSwitch

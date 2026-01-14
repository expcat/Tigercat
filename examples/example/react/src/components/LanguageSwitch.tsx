import React, { useMemo } from 'react'
import { Select } from '@tigercat/react'
import { DEMO_LANG_OPTIONS, type DemoLang } from '@demo-shared/app-config'

export interface LanguageSwitchProps {
  value: DemoLang
  onChange: (lang: DemoLang) => void
}

export const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ value, onChange }) => {
  const options = useMemo(
    () => DEMO_LANG_OPTIONS.map((o) => ({ label: o.label, value: o.value })),
    []
  )

  const handleChange = (next: string | number | (string | number)[] | undefined) => {
    const v = Array.isArray(next) ? next[0] : next
    if (v === 'zh-CN' || v === 'en-US') onChange(v)
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0 dark:text-gray-200">
        Lang:
      </span>
      <Select
        value={value}
        onChange={handleChange}
        options={options}
        size="sm"
        className="w-28 max-w-full"
      />
    </div>
  )
}

export default LanguageSwitch

import React, { useEffect, useState } from 'react'
import { Switch } from '@expcat/tigercat-react'
import { applyDarkMode, getStoredDarkMode, setStoredDarkMode } from '@demo-shared/prefs'
import type { DemoLang } from '@demo-shared/app-config'

export interface DarkModeSwitchProps {
  lang?: DemoLang
}

const DarkModeSwitch: React.FC<DarkModeSwitchProps> = ({ lang = 'zh-CN' }) => {
  const [enabled, setEnabled] = useState(() => getStoredDarkMode())

  useEffect(() => {
    applyDarkMode(enabled)
  }, [])

  const handleChange = (next: boolean) => {
    setEnabled(next)
    setStoredDarkMode(next)
    applyDarkMode(next)
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0 dark:text-gray-200">
        {lang === 'zh-CN' ? '暗色：' : 'Dark:'}
      </span>
      <Switch checked={enabled} size="sm" onChange={handleChange} />
    </div>
  )
}

export default DarkModeSwitch

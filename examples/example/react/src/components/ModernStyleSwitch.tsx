import React, { useEffect, useState } from 'react'
import { Switch } from '@expcat/tigercat-react'
import { applyModernStyle, getStoredModernStyle, setStoredModernStyle } from '@demo-shared/prefs'
import type { DemoLang } from '@demo-shared/app-config'

export interface ModernStyleSwitchProps {
  lang?: DemoLang
}

const ModernStyleSwitch: React.FC<ModernStyleSwitchProps> = ({ lang = 'zh-CN' }) => {
  const [enabled, setEnabled] = useState(() => getStoredModernStyle())

  useEffect(() => {
    applyModernStyle(enabled)
  }, [])

  const handleChange = (next: boolean) => {
    setEnabled(next)
    setStoredModernStyle(next)
    applyModernStyle(next)
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0 dark:text-gray-200">
        {lang === 'zh-CN' ? '现代：' : 'Modern:'}
      </span>
      <Switch checked={enabled} size="sm" onChange={handleChange} />
    </div>
  )
}

export default ModernStyleSwitch

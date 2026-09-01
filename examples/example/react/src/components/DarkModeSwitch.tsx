import React from 'react'
import { Switch } from '@expcat/tigercat-react/Switch'
import type { DemoLang } from '@demo-shared/app-config'
import { demoChrome } from '@demo-shared/chrome'

export interface DarkModeSwitchProps {
  lang?: DemoLang
  checked: boolean
  onChange: (enabled: boolean) => void
}

const DarkModeSwitch: React.FC<DarkModeSwitchProps> = ({ lang = 'zh-CN', checked, onChange }) => {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap shrink-0 dark:text-gray-200">
        {demoChrome(lang).dark}
      </span>
      <Switch checked={checked} size="sm" onChange={onChange} />
    </div>
  )
}

export default DarkModeSwitch

import React from 'react'
import { Icon } from '@expcat/tigercat-react/Icon'
import { iconNames, extendedIcons, type IconDefinition } from '@expcat/tigercat-core'

// 自定义 Logo：定义一次 IconDefinition，处处通过 icon 属性复用
const demoLogo: IconDefinition = {
  viewBox: '0 0 24 24',
  paths: ['M12 2 2 19.5h20L12 2Zm0 5.25 5.5 9.75h-11L12 7.25Z'],
  mode: 'fill'
}

export default function App() {
  return (
    <>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {Object.entries(extendedIcons).map(([n, def]) => (
          <div key={n} className="flex flex-col items-center gap-1">
            <Icon icon={def} size="lg" />
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center break-all">
              {n}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

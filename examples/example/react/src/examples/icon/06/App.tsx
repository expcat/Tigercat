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
      <div className="flex items-center gap-8">
        <div className="text-blue-600">
          <Icon>
            <svg>
              <path d="M5 13l4 4L19 7" />
            </svg>
          </Icon>
        </div>
        <Icon color="#ef4444">
          <svg>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6.01 4.01 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 17.99 4 20 6.01 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </Icon>
      </div>
    </>
  )
}

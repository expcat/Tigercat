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
      <div className="flex items-center gap-6 flex-wrap">
        <Icon>
          <svg>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </Icon>
        <Icon>
          <svg>
            <path d="M5 13l4 4L19 7" />
          </svg>
        </Icon>
        <Icon name="search" />
        <Icon name="plus" />
        <Icon name="edit" />
        <Icon name="trash" />
      </div>
    </>
  )
}

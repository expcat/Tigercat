import React from 'react'
import {
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  chevronRightSolidIcon20PathD,
  closeSolidIcon20PathD,
  selectChromeIconClasses,
  selectClearIconClasses
} from '@expcat/tigercat-core'

function TreeSelectIcon({ path, className }: { path: string; className: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={icon20ViewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false">
      <path fillRule="evenodd" d={path} clipRule="evenodd" />
    </svg>
  )
}

export function TreeSelectClearIcon() {
  return <TreeSelectIcon path={closeSolidIcon20PathD} className={selectClearIconClasses} />
}

export function TreeSelectChevronIcon() {
  return <TreeSelectIcon path={chevronDownSolidIcon20PathD} className={selectChromeIconClasses} />
}

export function TreeSelectNodeChevronIcon() {
  return (
    <TreeSelectIcon
      path={chevronRightSolidIcon20PathD}
      className="w-4 h-4 text-[var(--tiger-text-muted,#9ca3af)]"
    />
  )
}

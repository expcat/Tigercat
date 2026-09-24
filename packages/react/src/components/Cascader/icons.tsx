import { icon20ViewBox } from '@expcat/tigercat-core/icons/picker'
import { selectChromeIconClasses, selectClearIconClasses } from '@expcat/tigercat-core'
import {
  chevronDownSolidIcon20PathD,
  chevronRightSolidIcon20PathD,
  closeSolidIcon20PathD
} from '@expcat/tigercat-core/icons/picker'

function CascaderIcon({ path, className }: { path: string; className: string }) {
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

export function CascaderClearIcon() {
  return <CascaderIcon path={closeSolidIcon20PathD} className={selectClearIconClasses} />
}

export function CascaderChevronIcon() {
  return <CascaderIcon path={chevronDownSolidIcon20PathD} className={selectChromeIconClasses} />
}

export function CascaderColumnChevronIcon({ dir }: { dir: 'ltr' | 'rtl' }) {
  return (
    <span className={dir === 'rtl' ? 'inline-flex rotate-180' : 'inline-flex'}>
      <CascaderIcon
        path={chevronRightSolidIcon20PathD}
        className="w-4 h-4 text-[var(--tiger-text-secondary)]"
      />
    </span>
  )
}

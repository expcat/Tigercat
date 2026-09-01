import {
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  closeSolidIcon20PathD,
  checkSolidIcon20PathD,
  selectCheckIconClasses,
  selectChromeIconClasses,
  selectClearIconClasses
} from '@expcat/tigercat-core'

function SelectIcon({ path, className }: { path: string; className: string }) {
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

export function SelectCheckIcon() {
  return <SelectIcon path={checkSolidIcon20PathD} className={selectCheckIconClasses} />
}

export function SelectClearIcon() {
  return <SelectIcon path={closeSolidIcon20PathD} className={selectClearIconClasses} />
}

export function SelectChevronIcon() {
  return <SelectIcon path={chevronDownSolidIcon20PathD} className={selectChromeIconClasses} />
}

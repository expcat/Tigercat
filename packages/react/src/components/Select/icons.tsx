import React from 'react'
import {
  icon20ViewBox,
  chevronDownSolidIcon20PathD,
  closeSolidIcon20PathD,
  checkSolidIcon20PathD
} from '@expcat/tigercat-core'

const SelectIcon: React.FC<{ path: string; className: string }> = ({ path, className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox={icon20ViewBox}
    fill="currentColor">
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
)

export const SelectCheckIcon: React.FC = () => (
  <SelectIcon
    path={checkSolidIcon20PathD}
    className="w-5 h-5 text-[var(--tiger-select-check-icon,var(--tiger-primary,#2563eb))]"
  />
)

export const SelectClearIcon: React.FC = () => (
  <SelectIcon
    path={closeSolidIcon20PathD}
    className="w-4 h-4 text-[var(--tiger-select-icon,var(--tiger-text-muted,#9ca3af))] hover:text-[var(--tiger-select-icon-hover,var(--tiger-text-muted,#6b7280))]"
  />
)

export const SelectChevronIcon: React.FC = () => (
  <SelectIcon
    path={chevronDownSolidIcon20PathD}
    className="w-5 h-5 text-[var(--tiger-select-icon,var(--tiger-text-muted,#9ca3af))] transition-transform"
  />
)

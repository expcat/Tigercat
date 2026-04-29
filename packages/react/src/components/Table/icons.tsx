import React from 'react'
import {
  getSortIconClasses,
  getExpandIconClasses,
  getSpinnerSVG,
  getLoadingOverlaySpinnerClasses,
  icon16ViewBox,
  icon24ViewBox,
  sortAscIcon16PathD,
  sortDescIcon16PathD,
  sortBothIcon16PathD,
  expandChevronIcon16PathD,
  lockClosedIcon24PathD,
  lockOpenIcon24PathD
} from '@expcat/tigercat-core'

const spinnerSvg = getSpinnerSVG('spinner')

export const SortIcon: React.FC<{ direction: 'asc' | 'desc' | null }> = ({ direction }) => {
  const active = direction !== null
  const pathD =
    direction === 'asc'
      ? sortAscIcon16PathD
      : direction === 'desc'
        ? sortDescIcon16PathD
        : sortBothIcon16PathD

  return (
    <svg
      className={getSortIconClasses(active)}
      width="16"
      height="16"
      viewBox={icon16ViewBox}
      fill="currentColor">
      <path d={pathD} />
    </svg>
  )
}

export const LockIcon: React.FC<{ locked: boolean }> = ({ locked }) => {
  return (
    <svg width="14" height="14" viewBox={icon24ViewBox} fill="currentColor" aria-hidden="true">
      <path d={locked ? lockClosedIcon24PathD : lockOpenIcon24PathD} />
    </svg>
  )
}

export const ExpandIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => {
  return (
    <svg
      className={getExpandIconClasses(expanded)}
      width="16"
      height="16"
      viewBox={icon16ViewBox}
      fill="currentColor"
      aria-hidden="true">
      <path d={expandChevronIcon16PathD} />
    </svg>
  )
}

export const LoadingSpinner: React.FC = () => (
  <svg
    className={getLoadingOverlaySpinnerClasses()}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox={spinnerSvg.viewBox}>
    {spinnerSvg.elements.map((el, index) => {
      if (el.type === 'circle') return <circle key={index} {...el.attrs} />
      if (el.type === 'path') return <path key={index} {...el.attrs} />
      return null
    })}
  </svg>
)

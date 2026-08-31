import React from 'react'
import {
  getTreeNodeExpandIconClasses,
  treeLoadingClasses,
  treeNodeIndentClasses,
  getSpinnerSVG
} from '@expcat/tigercat-core'

const spinnerSvg = getSpinnerSVG('spinner')

export function ExpandIcon({
  expanded,
  expandable
}: {
  expanded: boolean
  expandable: boolean
}): React.ReactElement {
  if (!expandable) {
    return <span className={treeNodeIndentClasses} aria-hidden="true" />
  }

  return (
    <svg
      className={getTreeNodeExpandIconClasses(expanded)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false">
      <path d="M6 4l4 4-4 4V4z" />
    </svg>
  )
}

export function LoadingSpinner(): React.ReactElement {
  return (
    <svg
      className={treeLoadingClasses}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox={spinnerSvg.viewBox}
      aria-hidden="true"
      focusable="false">
      {spinnerSvg.elements.map((el, index) => {
        if (el.type === 'circle') return <circle key={index} {...el.attrs} />
        if (el.type === 'path') return <path key={index} {...el.attrs} />
        return null
      })}
    </svg>
  )
}

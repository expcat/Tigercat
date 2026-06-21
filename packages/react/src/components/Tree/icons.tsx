import React from 'react'
import {
  getTreeNodeExpandIconClasses,
  treeNodeIndentClasses,
  treeLoadingClasses,
  getSpinnerSVG
} from '@expcat/tigercat-core'

const spinnerSvg = getSpinnerSVG('spinner')

// Expand icon component
export const ExpandIcon: React.FC<{ expanded: boolean; hasChildren: boolean }> = ({
  expanded,
  hasChildren
}) => {
  if (!hasChildren) {
    return <span className={treeNodeIndentClasses} />
  }

  return (
    <svg
      className={getTreeNodeExpandIconClasses(expanded)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor">
      <path d="M6 4l4 4-4 4V4z" />
    </svg>
  )
}

// Loading spinner
export const LoadingSpinner: React.FC = () => (
  <svg
    className={treeLoadingClasses}
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

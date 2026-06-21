import React from 'react'
import { getSubMenuExpandIconClasses } from '@expcat/tigercat-core'

export const ExpandIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <svg
    className={getSubMenuExpandIconClasses(expanded)}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor">
    <path d="M6 9L1.5 4.5L2.205 3.795L6 7.59L9.795 3.795L10.5 4.5L6 9Z" />
  </svg>
)

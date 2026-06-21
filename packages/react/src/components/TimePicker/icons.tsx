import React from 'react'
import { icon20ViewBox } from '@expcat/tigercat-core'

export const Icon: React.FC<{ path: string; className: string }> = ({ path, className }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox={icon20ViewBox}
    fill="currentColor">
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
)

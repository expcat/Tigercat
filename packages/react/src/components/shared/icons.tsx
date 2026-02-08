/**
 * Shared React icon components — replaces per-component Icon
 * boilerplate in Alert, Message, Notification.
 */

import React from 'react'
import {
  icon24ViewBox,
  icon24StrokeWidth,
  icon24PathStrokeLinecap,
  icon24PathStrokeLinejoin,
  classNames
} from '@expcat/tigercat-core'

/**
 * 24×24 status SVG icon (info / success / warning / error).
 * Extra SVG attributes (e.g. aria-hidden, focusable) are spread onto the <svg>.
 */
export const StatusIcon: React.FC<
  { path: string; className: string } & React.SVGAttributes<SVGSVGElement>
> = ({ path, className, ...svgProps }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox={icon24ViewBox}
    stroke="currentColor"
    strokeWidth={icon24StrokeWidth}
    {...svgProps}>
    <path
      strokeLinecap={icon24PathStrokeLinecap}
      strokeLinejoin={icon24PathStrokeLinejoin}
      d={path}
    />
  </svg>
)

/**
 * Status icon with optional loading-spinner animation.
 */
export const StatusIconWithLoading: React.FC<{
  path: string
  className: string
  isLoading?: boolean
  spinnerClass?: string
}> = ({ path, className, isLoading = false, spinnerClass = '' }) => {
  const merged = classNames(className, isLoading && spinnerClass)
  return <StatusIcon path={path} className={merged} />
}

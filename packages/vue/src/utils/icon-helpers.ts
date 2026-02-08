/**
 * Shared Vue icon helpers — replaces per-component SVG boilerplate
 * in Alert, Message, Notification.
 */

import { h, type VNode } from 'vue'
import {
  icon24ViewBox,
  icon24StrokeWidth,
  icon24PathStrokeLinecap,
  icon24PathStrokeLinejoin,
  classNames
} from '@expcat/tigercat-core'

/**
 * Create a 24×24 status SVG icon (info / success / warning / error).
 */
export function createStatusIcon(
  path: string,
  className: string,
  extraAttrs?: Record<string, string>
): VNode {
  return h(
    'svg',
    {
      class: className,
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: icon24ViewBox,
      stroke: 'currentColor',
      'stroke-width': String(icon24StrokeWidth),
      ...extraAttrs
    },
    [
      h('path', {
        'stroke-linecap': icon24PathStrokeLinecap,
        'stroke-linejoin': icon24PathStrokeLinejoin,
        d: path
      })
    ]
  )
}

/**
 * Status icon with optional loading-spinner class.
 */
export function createStatusIconWithLoading(
  path: string,
  className: string,
  isLoading: boolean,
  spinnerClass: string
): VNode {
  const merged = classNames(className, isLoading && spinnerClass)
  return createStatusIcon(path, merged)
}

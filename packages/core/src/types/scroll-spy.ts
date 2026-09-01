import type { ScrollRootInput } from './scroll-root'

export type ScrollSpyKey = string | number

export type ScrollSpyDirection = 'vertical' | 'horizontal'

export interface ScrollSpyItem {
  key: ScrollSpyKey
  href: string
  label: string
  disabled?: boolean
  children?: ScrollSpyItem[]
}

export interface ScrollSpyChangePayload {
  activeKey: ScrollSpyKey
  href: string
  item: ScrollSpyItem
  source: 'scroll' | 'click'
}

export interface ScrollSpyProps {
  /** Nav tree. Required for a useful TOC. */
  items?: ScrollSpyItem[]
  activeKey?: ScrollSpyKey
  defaultActiveKey?: ScrollSpyKey
  /**
   * Scroll offset from the container top. Also used as sticky `top` when
   * `sticky` is set. `targetOffset` is an alias of this value.
   * @default 0
   */
  offsetTop?: number
  /** Alias of `offsetTop`. */
  targetOffset?: number
  bounds?: number
  direction?: ScrollSpyDirection
  sticky?: boolean
  ariaLabel?: string
  className?: string
  style?: Record<string, string | number>
  /**
   * Scroll root: selector, element, window, or getter. Invalid values fall
   * back to `window`.
   */
  getContainer?: ScrollRootInput
}

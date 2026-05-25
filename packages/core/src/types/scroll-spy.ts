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
  items?: ScrollSpyItem[]
  activeKey?: ScrollSpyKey
  defaultActiveKey?: ScrollSpyKey
  offsetTop?: number
  targetOffset?: number
  bounds?: number
  direction?: ScrollSpyDirection
  sticky?: boolean
  ariaLabel?: string
  className?: string
  style?: Record<string, string | number>
}

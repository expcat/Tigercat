import { h, type VNodeChild } from 'vue'
import {
  getSortIconClasses,
  getExpandIconClasses,
  icon16ViewBox,
  icon24ViewBox,
  sortAscIcon16PathD,
  sortDescIcon16PathD,
  sortBothIcon16PathD,
  expandChevronIcon16PathD,
  lockClosedIcon24PathD,
  lockOpenIcon24PathD,
  type SortDirection
} from '@expcat/tigercat-core'

export const SortIcon = (direction: SortDirection): VNodeChild => {
  const active = direction !== null
  const pathD =
    direction === 'asc'
      ? sortAscIcon16PathD
      : direction === 'desc'
        ? sortDescIcon16PathD
        : sortBothIcon16PathD

  return h(
    'svg',
    {
      class: getSortIconClasses(active),
      width: '16',
      height: '16',
      viewBox: icon16ViewBox,
      fill: 'currentColor',
      'aria-hidden': 'true'
    },
    [h('path', { d: pathD })]
  )
}

export const LockIcon = (locked: boolean): VNodeChild => {
  return h(
    'svg',
    {
      width: '14',
      height: '14',
      viewBox: icon24ViewBox,
      fill: 'currentColor',
      'aria-hidden': 'true'
    },
    [h('path', { d: locked ? lockClosedIcon24PathD : lockOpenIcon24PathD })]
  )
}

export const ExpandIcon = (expanded: boolean): VNodeChild => {
  return h(
    'svg',
    {
      class: getExpandIconClasses(expanded),
      width: '16',
      height: '16',
      viewBox: icon16ViewBox,
      fill: 'currentColor',
      'aria-hidden': 'true'
    },
    [h('path', { d: expandChevronIcon16PathD })]
  )
}

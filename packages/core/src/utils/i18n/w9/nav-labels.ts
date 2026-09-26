/**
 * W9 navigation strings that are not in locale data files.
 */

export interface NavLabels {
  dangerItem: string
  moreTabs: string
  breadcrumbCollapsed: string
  breadcrumbCollapse: string
  paginationJump: string
  menuCollapsedTip: string
  directory: string
}

export const navLabels: NavLabels = {
  dangerItem: 'Danger',
  moreTabs: 'More',
  breadcrumbCollapsed: 'Collapsed links',
  breadcrumbCollapse: 'Collapse',
  paginationJump: 'Go to page',
  menuCollapsedTip: 'Menu item',
  directory: 'Directory'
}

export function formatNavLabel(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = values[key]
    return value === undefined ? match : String(value)
  })
}

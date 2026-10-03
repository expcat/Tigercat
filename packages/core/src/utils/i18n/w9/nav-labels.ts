/**
 * W9 navigation strings that are not in locale data files.
 */

export interface NavLabels {
  dangerItem: string
  breadcrumbCollapsed: string
  breadcrumbCollapse: string
  paginationJump: string
  menuCollapsedTip: string
  directory: string
}

export const navLabels: NavLabels = {
  dangerItem: 'Danger',
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

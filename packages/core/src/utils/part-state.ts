/**
 * One CSS contract for Vue and React.
 * Frameworks render these attributes. They do not keep a second class map.
 */

export interface PartAttrMap {
  'data-tiger-part': string
  'data-tiger-scope': string
}

export interface StateAttrMap {
  'data-state': string
}

export function partAttrs(component: string, part: string): PartAttrMap {
  return {
    'data-tiger-part': part,
    'data-tiger-scope': component
  }
}

export function stateAttrs(state: string): StateAttrMap {
  return { 'data-state': state }
}

/** Part names only. State values stay on `data-state`. */
export const COMPONENT_PARTS = {
  Button: ['root'],
  Modal: ['backdrop', 'content', 'title', 'close'],
  Select: ['root', 'trigger', 'popup', 'option'],
  Tabs: ['root', 'list', 'tab', 'panel'],
  Menu: ['root', 'item', 'popup']
} as const

export type ComponentPartName = keyof typeof COMPONENT_PARTS

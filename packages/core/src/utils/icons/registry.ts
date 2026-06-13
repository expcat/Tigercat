/**
 * Named built-in icon set.
 *
 * Exposes a small, curated collection of 24x24 outline (stroke) icons so the
 * public `Icon` component can render glyphs by `name` instead of every consumer
 * hand-authoring inline SVG. Definitions are framework-agnostic path data; the
 * Vue/React `Icon` components turn an `IconDefinition` into an `<svg>`.
 *
 * The set is intentionally additive — new entries can be appended without
 * breaking existing usage. Where an icon already exists internally (close,
 * status glyphs) the shared constant is reused.
 *
 * Subpath: `@expcat/tigercat-core/icons/registry`
 */

import { closeIconPathD } from './common'
import {
  statusSuccessIconPath,
  statusWarningIconPath,
  statusErrorIconPath,
  statusInfoIconPath
} from './status'

/**
 * Rendering mode for a built-in icon.
 * - `stroke`: outline icon drawn with `stroke="currentColor"` and `fill="none"`.
 * - `fill`: solid icon drawn with `fill="currentColor"` and `stroke="none"`.
 */
export type IconRenderMode = 'stroke' | 'fill'

/**
 * A single built-in icon definition.
 */
export interface IconDefinition {
  /** SVG `viewBox` for the paths. */
  viewBox: string
  /** One or more `<path d="...">` strings composing the glyph. */
  paths: string[]
  /** How the paths should be painted. @default 'stroke' */
  mode: IconRenderMode
}

const stroke24 = (...paths: string[]): IconDefinition => ({
  viewBox: '0 0 24 24',
  paths,
  mode: 'stroke'
})

/**
 * Built-in icon registry keyed by icon name.
 */
export const iconRegistry = {
  // --- Reused internal glyphs ---
  close: stroke24(closeIconPathD),
  success: stroke24(statusSuccessIconPath),
  warning: stroke24(statusWarningIconPath),
  error: stroke24(statusErrorIconPath),
  info: stroke24(statusInfoIconPath),

  // --- Curated outline set (Heroicons-style, 24x24) ---
  check: stroke24('m4.5 12.75 6 6 9-13.5'),
  'chevron-up': stroke24('m4.5 15.75 7.5-7.5 7.5 7.5'),
  'chevron-down': stroke24('m19.5 8.25-7.5 7.5-7.5-7.5'),
  'chevron-left': stroke24('M15.75 19.5 8.25 12l7.5-7.5'),
  'chevron-right': stroke24('m8.25 4.5 7.5 7.5-7.5 7.5'),
  'arrow-left': stroke24('M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18'),
  'arrow-right': stroke24('M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3'),
  'arrow-up': stroke24('M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18'),
  'arrow-down': stroke24('M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3'),
  search: stroke24(
    'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
  ),
  plus: stroke24('M12 4.5v15m7.5-7.5h-15'),
  minus: stroke24('M5 12h14'),
  edit: stroke24(
    'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10'
  ),
  trash: stroke24(
    'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0'
  ),
  user: stroke24(
    'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z'
  ),
  settings: stroke24(
    'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.004.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a7.723 7.723 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z',
    'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
  ),
  eye: stroke24(
    'M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z',
    'M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'
  ),
  'eye-off': stroke24(
    'M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88'
  ),
  calendar: stroke24(
    'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5'
  ),
  clock: stroke24('M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'),
  menu: stroke24('M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'),
  'more-horizontal': stroke24(
    'M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z'
  ),
  'more-vertical': stroke24(
    'M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z'
  ),
  'external-link': stroke24(
    'M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25'
  )
} satisfies Record<string, IconDefinition>

/**
 * Union of all built-in icon names.
 */
export type IconName = keyof typeof iconRegistry

/**
 * All built-in icon names (useful for documentation / iteration).
 */
export const iconNames = Object.keys(iconRegistry) as IconName[]

/**
 * Look up a built-in icon definition by name. Returns `undefined` for unknown
 * names so callers can fall back gracefully.
 */
export function getIconDefinition(name: string): IconDefinition | undefined {
  return (iconRegistry as Record<string, IconDefinition>)[name]
}

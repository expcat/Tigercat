import { classNames } from './class-names'

export type JoinedGroupOrientation = 'horizontal' | 'vertical'
export type JoinedGroupFocus = 'focus' | 'focus-within'

/** Compact-group chrome marker. Direct children or nested hosts may set this. */
export const TIGER_CHROME_ATTR = 'data-tiger-chrome'

export interface JoinedGroupItemClassesOptions {
  orientation?: JoinedGroupOrientation
  /**
   * Direct-child selector joined by the group. `button` so only Button roots
   * pick up the seam; `*` for InputGroup compact (input chrome + addons).
   */
  child?: string
  focus?: JoinedGroupFocus
}

/**
 * Child-selector classes that shave inner corners of adjacent items.
 * A lone child is both first and last, so it keeps all four radii.
 */
export function getJoinedGroupItemClasses(options: JoinedGroupItemClassesOptions = {}): string {
  const child = options.child ?? '*'
  const focus = options.focus ?? 'focus'
  const sel = `[&>${child}`

  if (options.orientation === 'vertical') {
    return classNames(
      `${sel}:not(:first-child):not(:last-child)]:!rounded-none`,
      `${sel}:first-child:not(:last-child)]:!rounded-b-none`,
      `${sel}:last-child:not(:first-child)]:!rounded-t-none`,
      `${sel}:not(:first-child)]:-mt-px`,
      `${sel}:${focus}]:z-10`,
      `${sel}:${focus}]:relative`
    )
  }

  return classNames(
    `${sel}:not(:first-child):not(:last-child)]:!rounded-none`,
    `${sel}:first-child:not(:last-child)]:!rounded-e-none`,
    `${sel}:last-child:not(:first-child)]:!rounded-s-none`,
    `${sel}:not(:first-child)]:-ms-px`,
    `${sel}:${focus}]:z-10`,
    `${sel}:${focus}]:relative`
  )
}

/**
 * Compact selectors for InputGroup: shave chrome marked with
 * {@link TIGER_CHROME_ATTR}, whether it is the group child or nested inside
 * a width/extras wrapper. Overlap and z-index apply to the group child.
 */
export function getJoinedChromeGroupItemClasses(
  options: { focus?: JoinedGroupFocus } = {}
): string {
  const focus = options.focus ?? 'focus-within'
  const chrome = `[${TIGER_CHROME_ATTR}]`

  return classNames(
    `[&>:not(:first-child):not(:last-child)_${chrome}]:!rounded-none`,
    `[&>:first-child:not(:last-child)_${chrome}]:!rounded-e-none`,
    `[&>:last-child:not(:first-child)_${chrome}]:!rounded-s-none`,
    `[&>${chrome}:not(:first-child):not(:last-child)]:!rounded-none`,
    `[&>${chrome}:first-child:not(:last-child)]:!rounded-e-none`,
    `[&>${chrome}:last-child:not(:first-child)]:!rounded-s-none`,
    `[&>:not(:first-child)]:-ms-px`,
    `[&>:${focus}]:z-10`,
    `[&>:${focus}]:relative`
  )
}

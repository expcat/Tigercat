import { classNames } from './class-names'

export type JoinedGroupOrientation = 'horizontal' | 'vertical'
export type JoinedGroupFocus = 'focus' | 'focus-within'

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

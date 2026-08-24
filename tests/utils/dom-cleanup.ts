/**
 * Reset the shared happy-dom document between tests.
 *
 * Two leaks this covers:
 *
 * 1. `<html>` inline style / class / `data-tiger-style`. Specs set theme CSS
 *    variables via `theme-helpers.ts` and toggle `dark` directly, but
 *    `clearThemeVariables(names)` requires the caller to pass back the exact
 *    same names, so a forgotten variable — or a spec that fails before its
 *    own afterEach — leaks into every later spec sharing this document.
 *
 * 2. Empty body host `<div>`s from portal/Teleport. `@testing-library/vue`
 *    cleanup only removes its mount wrapper when
 *    `wrapper.element.parentNode.parentNode === document.body`. Vue Teleport
 *    (Modal, Drawer, ImagePreview, Tour, …) reparents the component root onto
 *    `document.body`, so that check fails and an empty host is left behind.
 *    React Testing Library only removes containers it still tracks, so those
 *    leftover Vue hosts survive into later files whenever the document is
 *    reused (`--no-isolate`, or isolate environment reuse under load).
 *    Document-wide queries in BackTop / Avatar / Image (`screen.getByRole`,
 *    `screen.getByText`, `document.querySelector('[aria-label="Close preview"]')`)
 *    then flake against leftover hosts or teleported overlays.
 *
 * Call this after Vue/React Testing Library cleanup. Specs that attach nodes
 * in `beforeEach` re-create them for the next test.
 */
export function resetTestDocument(): void {
  if (typeof document === 'undefined') return

  const { documentElement, body } = document

  documentElement.removeAttribute('style')
  documentElement.removeAttribute('class')
  documentElement.removeAttribute('data-tiger-style')

  if (body) {
    body.replaceChildren()
    body.removeAttribute('style')
    body.removeAttribute('class')
  }

  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo(0, 0)
  }
}

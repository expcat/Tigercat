/**
 * @vitest-environment node
 */
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LAYOUT_GRID_CSS, THEME_CSS_VARS } from '@expcat/tigercat-core'

const indexSource = readFileSync(new URL('../../packages/core/src/index.ts', import.meta.url), 'utf8')
const stylesSource = readFileSync(
  new URL('../../packages/core/src/utils/styles/index.ts', import.meta.url),
  'utf8'
)
const builtIndex = readFileSync(new URL('../../packages/core/dist/index.js', import.meta.url), 'utf8')
const packageJson = JSON.parse(
  readFileSync(new URL('../../packages/core/package.json', import.meta.url), 'utf8')
) as { sideEffects: boolean; exports: Record<string, unknown> }

describe('foundation entry', () => {
  it('keeps Tailwind and heavy subpath modules out of the main entry', () => {
    expect(indexSource).not.toMatch(/tailwind-plugin|tailwindcss/)
    expect(indexSource).not.toMatch(/export const version/)
    expect(builtIndex).not.toMatch(/from ["']tailwindcss/)
    expect(packageJson.sideEffects).toBe(false)
    expect(packageJson.exports['./tailwind']).toBeTruthy()
    expect(packageJson.exports['./tailwind/modern']).toBeUndefined()
    expect(Object.keys(packageJson.exports).some((key) => key.startsWith('./datepicker-locales'))).toBe(
      false
    )
  })

  it('does not re-export reducers from the styles barrel', () => {
    expect(stylesSource).not.toMatch(/form-validation|workflow-runtime|tree-controller|menu-controller|navigation-menu-controller|chart-interaction/)
    expect(stylesSource).not.toMatch(/internal\//)
  })

  it('layout geometry is static media CSS', () => {
    expect(LAYOUT_GRID_CSS).toContain('@media (min-width:')
    expect(LAYOUT_GRID_CSS).not.toContain('data-tiger-bp')
    expect(LAYOUT_GRID_CSS).not.toContain('row-reverse')
    expect(THEME_CSS_VARS).not.toHaveProperty('textMuted')
    expect(THEME_CSS_VARS).not.toHaveProperty('fill')
    expect(THEME_CSS_VARS).not.toHaveProperty('bg')
  })
})

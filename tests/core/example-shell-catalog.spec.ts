/**
 * @vitest-environment node
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { DEMO_NAV_GROUPS, listDemoNavItems } from '../../examples/example/shared/app-config'

describe('example catalog entry', () => {
  it('lists every DEMO_NAV_GROUPS item as a link into the Vue example app', () => {
    const html = readFileSync(resolve(process.cwd(), 'examples/index.html'), 'utf8')
    const items = listDemoNavItems()
    expect(items.length).toBeGreaterThan(100)
    expect(html).toContain(`<div class="stat-value">${items.length}</div>`)
    expect(html).not.toContain('172 个组件')
    expect(html).not.toContain('data-theme')
    expect(html).toContain('tigercat-example-dark')

    for (const group of DEMO_NAV_GROUPS) {
      expect(html).toContain(`id="${group.key}"`)
      for (const item of group.items) {
        expect(html, item.key).toContain(`href="./vue/#${item.path}"`)
      }
    }
  })
})

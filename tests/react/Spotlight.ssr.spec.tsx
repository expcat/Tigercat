/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { Spotlight } from '@expcat/tigercat-react/Spotlight'

describe('Spotlight (SSR)', () => {
  it('selects the first result and names it as the active descendant', () => {
    expect(typeof document).toBe('undefined')
    const html = renderToStaticMarkup(
      <Spotlight
        open
        items={[
          { key: 'docs', label: 'Docs' },
          { key: 'settings', label: 'Settings' }
        ]}
      />
    )
    const input = html.match(/<input\b[^>]*>/)?.[0]
    const options = [...html.matchAll(/<div\b[^>]*role="option"[^>]*>/g)].map((match) => match[0])
    const selectedId = options[0]?.match(/\bid="([^"]+)"/)?.[1]

    expect(options[0]).toContain('aria-selected="true"')
    expect(options[1]).toContain('aria-selected="false"')
    expect(selectedId).toBeTruthy()
    expect(input).toContain(`aria-activedescendant="${selectedId}"`)
  })
})

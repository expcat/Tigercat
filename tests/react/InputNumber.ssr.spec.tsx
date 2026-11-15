/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { InputNumber } from '@expcat/tigercat-react/InputNumber'

describe('InputNumber (SSR)', () => {
  it('renders zero consistently in the visible input, ARIA and hidden field', () => {
    expect(typeof document).toBe('undefined')
    const html = renderToStaticMarkup(<InputNumber value={0} name="quantity" />)
    const input = html.match(/<input\b[^>]*role="spinbutton"[^>]*>/)?.[0]
    const hidden = html.match(/<input\b[^>]*type="hidden"[^>]*>/)?.[0]

    expect(input).toContain('value="0"')
    expect(input).toContain('aria-valuenow="0"')
    expect(hidden).toContain('name="quantity"')
    expect(hidden).toContain('value="0"')
  })
})

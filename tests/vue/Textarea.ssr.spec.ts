/**
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { Textarea } from '@expcat/tigercat-vue/Textarea'

describe('Textarea (SSR)', () => {
  it('renders a numeric FormItem initial value as text without a DOM', async () => {
    expect(typeof document).toBe('undefined')
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(Form, { modelValue: { bio: 123 } }, () =>
            h(FormItem, { name: 'bio', label: 'Bio' }, () => h(Textarea))
          )
      })
    )

    expect(html.match(/<textarea\b[^>]*>([\s\S]*?)<\/textarea>/)?.[1]).toBe('123')
  })
})

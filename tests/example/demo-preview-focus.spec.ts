/**
 * @vitest-environment happy-dom
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const previewFocusClass =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--tiger-focus-ring)]'

const demoBlocks = [
  'examples/example/react/src/components/DemoBlock.tsx',
  'examples/example/vue3/src/components/DemoBlock.vue'
]

function iframeClass(source: string): string {
  const match = source.match(/<iframe[\s\S]*?class(?:Name)?="([^"]+)"/)
  if (!match) throw new Error('preview iframe class not found')
  return match[1]
}

describe('example preview focus', () => {
  it('keeps a visible keyboard indicator on the preview iframe', () => {
    for (const file of demoBlocks) {
      const className = iframeClass(readFileSync(file, 'utf8'))
      expect(className).toContain(previewFocusClass)
      const iframe = document.createElement('iframe')
      iframe.className = className
      document.body.append(iframe)
      iframe.focus()
      expect(document.activeElement).toBe(iframe)
      expect(iframe.className).toContain('focus-visible:outline-offset-[-2px]')
      iframe.remove()
    }
  })
})

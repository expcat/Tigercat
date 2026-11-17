import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const files = [
  'examples/example/vue3/src/examples/use-drag/01/App.vue',
  'examples/example/react/src/examples/use-drag/01/App.tsx'
]

describe('use-drag tag example', () => {
  it('does not pass color to Tag', () => {
    for (const file of files) {
      const source = readFileSync(file, 'utf8')
      expect(source).toContain('<Tag>')
      expect(source).not.toMatch(/<Tag\s+color=/)
    }
  })
})

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { collectFiles } from '../utils/files.mjs'

export function assertSsrArtifacts(framework, directory) {
  const htmlDir = join(directory, framework === 'next' ? '.next/server/app' : '.output/public')
  const cssDir = join(directory, framework === 'next' ? '.next/static' : '.output/public/_nuxt')
  const html = collectFiles(htmlDir, ['.html'])
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n')
  const css = collectFiles(cssDir, ['.css'])
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n')
  for (const [kind, content, markers] of [
    ['HTML', html, ['保存', '2024-01-15', 'tiger-bar-grad-', 'url(#']],
    ['CSS', css, ['--tiger-primary']]
  ]) {
    const missing = markers.filter((marker) => !content.includes(marker))
    if (missing.length > 0) {
      throw new Error(`${framework} SSR ${kind} is missing: ${missing.join(', ')}`)
    }
  }
}

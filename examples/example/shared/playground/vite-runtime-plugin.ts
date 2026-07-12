/// <reference types="node" />

import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

export const PLAYGROUND_RUNTIME_ID = 'virtual:tigercat-playground-runtime'
const RESOLVED_RUNTIME_ID = `\0${PLAYGROUND_RUNTIME_ID}`

export interface PlaygroundRuntimeEntry {
  file: string
  devUrl: string
}

export function playgroundRuntimePlugin(entries: Record<string, PlaygroundRuntimeEntry>): Plugin {
  let config: ResolvedConfig

  return {
    name: 'tigercat-playground-runtime',
    enforce: 'pre',
    configResolved(nextConfig) {
      config = nextConfig
    },
    resolveId(id) {
      if (id === PLAYGROUND_RUNTIME_ID) return RESOLVED_RUNTIME_ID
      return null
    },
    load(id) {
      if (id !== RESOLVED_RUNTIME_ID) return null

      if (config.command === 'serve') {
        const urls = Object.fromEntries(
          Object.entries(entries).map(([key, entry]) => [key, entry.devUrl])
        )
        return `export default ${JSON.stringify(urls)}`
      }

      const values = Object.entries(entries).map(([key, entry]) => {
        const referenceId = this.emitFile({
          type: 'chunk',
          id: path.resolve(entry.file),
          name: `playground-${key}`,
          // Vite 对非 lib 构建传 preserveEntrySignatures: false,不按 chunk
          // 覆盖的话 rolldown 会剥掉这些 import-map 入口的导出签名
          preserveSignature: 'strict'
        })
        return `${JSON.stringify(key)}: import.meta.ROLLUP_FILE_URL_${referenceId}`
      })
      return `export default { ${values.join(', ')} }`
    }
  }
}

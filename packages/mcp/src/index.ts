import { fileURLToPath } from 'node:url'
import { realpathSync } from 'node:fs'
import { resolve } from 'node:path'

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { createTigercatMcpServer } from './server'
import { diagnoseTigercatMcp } from './skill-index'

export { createTigercatMcpServer } from './server'
export { diagnoseTigercatMcp, loadSkillIndex } from './skill-index'
export {
  getCategoryComponents,
  getInventory,
  getTigercatComponent,
  routeTigercatTask,
  searchTigercat
} from './router'
export type {
  ComponentLookupResult,
  ComponentMetadata,
  ComponentRoute,
  DoctorResult,
  InventorySummary,
  ReferenceSource,
  SearchResponse,
  SearchResult,
  SkillIndex,
  TaskRouteResult,
  TigercatFramework,
  TigercatMcpOptions
} from './types'

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  if (options.help) {
    console.log(helpText())
    return
  }

  if (options.doctor) {
    const result = await diagnoseTigercatMcp(options.root)
    console.log(
      [
        `Tigercat MCP doctor: ${result.ok ? 'ok' : 'failed'}`,
        `root: ${result.root}`,
        `components: ${result.componentCount}`,
        `aliases: ${result.aliasCount}`,
        `topics: ${result.topicCount}`,
        `readable references: ${result.readableReferenceCount}`,
        ...result.issues.map((issue) => `- ${issue}`)
      ].join('\n')
    )
    if (!result.ok) process.exitCode = 1
    return
  }

  const server = createTigercatMcpServer({ root: options.root })
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

function parseArgs(args: string[]): { root?: string; help: boolean; doctor: boolean } {
  let root: string | undefined
  let help = false
  let doctor = false

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]

    if (arg === '--help' || arg === '-h') {
      help = true
      continue
    }

    if (arg === '--doctor') {
      doctor = true
      continue
    }

    if (arg === '--root') {
      const value = args[index + 1]
      if (!value) {
        throw new Error('Usage: tigercat-mcp --root <repo-root>')
      }
      root = resolve(value)
      index++
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return { root, help, doctor }
}

function helpText(): string {
  return [
    'Usage: tigercat-mcp [--root <repo-root>] [--doctor]',
    '',
    'Runs the Tigercat skill MCP server over stdio.',
    '--doctor validates the generated inventory and exits without starting stdio.',
    'If --root is omitted, the server searches upward from the current directory for context7.json.',
    '',
    'Example MCP client command:',
    '  tigercat-mcp --root /path/to/Tigercat'
  ].join('\n')
}

// argv[1] 可能是 npm .bin 软链或 macOS /var -> /private/var 这类符号链接路径,
// 必须 realpath 后再与模块自身路径比较,否则 bin 会静默退出。
const isDirectRun = (() => {
  if (process.argv[1] === undefined) return false
  try {
    return fileURLToPath(import.meta.url) === realpathSync(resolve(process.argv[1]))
  } catch {
    return false
  }
})()

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}

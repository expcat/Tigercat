import { fileURLToPath } from 'node:url'
import { realpathSync } from 'node:fs'
import { resolve } from 'node:path'

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { createTigercatMcpServer } from './server'
import { diagnoseTigercatMcp } from './skill-index'
import { DEFAULT_REMOTE_BASE_URL } from './source'
import type { TigercatMcpOptions } from './types'

export { createTigercatMcpServer } from './server'
export { diagnoseTigercatMcp, loadSkillIndex } from './skill-index'
export { DEFAULT_REMOTE_BASE_URL } from './source'
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
  LoadSkillIndexOptions,
  ReferenceSource,
  SearchResponse,
  SearchResult,
  SkillIndex,
  SkillSource,
  TaskRouteResult,
  TigercatFramework,
  TigercatMcpOptions
} from './types'

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2))

  if (parsed.help) {
    console.log(helpText())
    return
  }

  const options = resolveOptions(parsed)

  if (parsed.doctor) {
    const result = await diagnoseTigercatMcp(options)
    console.log(
      [
        `Tigercat MCP doctor: ${result.ok ? 'ok' : 'failed'}`,
        `mode: ${result.mode === 'http' ? 'remote' : 'local'}`,
        `${result.mode === 'http' ? 'base url' : 'root'}: ${result.root}`,
        ...(result.remoteVersion ? [`remote version: ${result.remoteVersion}`] : []),
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

  const server = createTigercatMcpServer(options)
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

interface ParsedArgs {
  root?: string
  baseUrl?: string
  help: boolean
  doctor: boolean
}

function parseArgs(args: string[]): ParsedArgs {
  let root: string | undefined
  let baseUrl: string | undefined
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

    if (arg === '--base-url') {
      const value = args[index + 1]
      if (!value) {
        throw new Error('Usage: tigercat-mcp --base-url <skills-base-url>')
      }
      baseUrl = value
      index++
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return { root, baseUrl, help, doctor }
}

// 优先级:--root > --base-url > TIGERCAT_MCP_BASE_URL > 官方 GitHub Pages 地址。
function resolveOptions(parsed: ParsedArgs): TigercatMcpOptions {
  if (parsed.root) {
    if (parsed.baseUrl) {
      // stdout 是 MCP stdio 通道,警告只能走 stderr。
      console.error('tigercat-mcp: --root takes precedence over --base-url; ignoring --base-url.')
    }
    return { root: parsed.root }
  }

  const envBaseUrl = process.env.TIGERCAT_MCP_BASE_URL?.trim()
  return { baseUrl: parsed.baseUrl ?? (envBaseUrl || undefined) ?? DEFAULT_REMOTE_BASE_URL }
}

function helpText(): string {
  return [
    'Usage: tigercat-mcp [--root <repo-root>] [--base-url <skills-base-url>] [--doctor]',
    '',
    'Runs the Tigercat skill MCP server over stdio.',
    `By default skill references are fetched from ${DEFAULT_REMOTE_BASE_URL} (GitHub Pages).`,
    '',
    '  --root <repo-root>       read skills from a local Tigercat checkout (dev/offline mode).',
    '  --base-url <url>         fetch skills from a mirror of the /mcp/ Pages route.',
    '  --doctor                 validate the skill inventory and exit without starting stdio.',
    '  TIGERCAT_MCP_BASE_URL    environment fallback for --base-url.',
    '',
    'Examples:',
    '  tigercat-mcp                                   # remote skills (default)',
    '  tigercat-mcp --root /path/to/Tigercat          # local checkout',
    '  tigercat-mcp --base-url https://mirror.example.com/mcp/',
    '',
    'If GitHub Pages is unreachable (offline, proxy, regional block), use --root or --base-url.'
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

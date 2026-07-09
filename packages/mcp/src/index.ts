import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { createTigercatMcpServer } from './server'

export { createTigercatMcpServer } from './server'
export { loadSkillIndex } from './skill-index'
export { lookupTigercatComponent, routeTigercatTask } from './router'
export type {
  ComponentLookupResult,
  ComponentRoute,
  ReferenceSource,
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

  const server = createTigercatMcpServer({ root: options.root })
  const transport = new StdioServerTransport()
  await server.connect(transport)
}

function parseArgs(args: string[]): { root?: string; help: boolean } {
  let root: string | undefined
  let help = false

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]

    if (arg === '--help' || arg === '-h') {
      help = true
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

  return { root, help }
}

function helpText(): string {
  return [
    'Usage: tigercat-mcp [--root <repo-root>]',
    '',
    'Runs the Tigercat skill MCP server over stdio.',
    'If --root is omitted, the server searches upward from the current directory for context7.json.',
    '',
    'Example MCP client command:',
    '  tigercat-mcp --root /path/to/Tigercat'
  ].join('\n')
}

const isDirectRun =
  process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}

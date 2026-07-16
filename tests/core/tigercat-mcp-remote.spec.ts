/**
 * @vitest-environment node
 *
 * 远程模式(HTTP SkillSource)测试:用本地 node:http 服务模拟 GitHub Pages 的
 * /mcp/ 路由(服务仓库根下的 context7.json 与 skills/tigercat/**),不触真网。
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join, resolve } from 'node:path'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { diagnoseTigercatMcp, getTigercatComponent, loadSkillIndex } from '@expcat/tigercat-mcp'
import { readReferenceSource } from '../../packages/mcp/src/skill-index'

const execFileAsync = promisify(execFile)
const root = process.cwd()

interface SkillServer {
  server: Server
  failPaths: Set<string>
  overrides: Map<string, string>
}

// prefix 非空时只在该前缀下服务(如 'mcp/'),模拟 Pages 子路径部署。
function createSkillServer(repoRoot: string, prefix = ''): SkillServer {
  const failPaths = new Set<string>()
  const overrides = new Map<string, string>()
  const server = createServer((request, response) => {
    void (async () => {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1')
      let pathname = decodeURIComponent(url.pathname).replace(/^\/+/, '')

      if (!pathname || pathname.split('/').includes('..')) {
        response.statusCode = 400
        response.end('bad request')
        return
      }

      if (prefix) {
        if (!pathname.startsWith(prefix)) {
          response.statusCode = 404
          response.end('not found')
          return
        }
        pathname = pathname.slice(prefix.length)
      }

      if (failPaths.has(pathname)) {
        response.statusCode = 404
        response.end('not found')
        return
      }

      const contentType = pathname.endsWith('.json') ? 'application/json' : 'text/markdown'
      const override = overrides.get(pathname)
      if (override !== undefined) {
        response.setHeader('content-type', contentType)
        response.end(override)
        return
      }

      try {
        const content = await readFile(join(repoRoot, pathname))
        response.setHeader('content-type', contentType)
        response.end(content)
      } catch {
        response.statusCode = 404
        response.end('not found')
      }
    })()
  })

  return { server, failPaths, overrides }
}

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolvePromise) => {
    server.listen(0, '127.0.0.1', resolvePromise)
  })
  const { port } = server.address() as AddressInfo
  return `http://127.0.0.1:${port}/`
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolvePromise) => {
    server.close(() => resolvePromise())
  })
}

let skillServer: SkillServer
let baseUrl = ''

beforeAll(async () => {
  skillServer = createSkillServer(root)
  baseUrl = await listen(skillServer.server)
})

afterAll(async () => {
  await close(skillServer.server)
})

describe('Tigercat MCP remote skill index', () => {
  it('loads the same inventory and allow-list remotely as from the local checkout', async () => {
    const remote = await loadSkillIndex({ baseUrl })
    const local = await loadSkillIndex(root)

    expect(remote.source.kind).toBe('http')
    expect(remote.root).toBe(baseUrl)
    expect(remote.context7.generated_by).toBe('pnpm docs:api')
    expect(remote.components.size).toBe(149)
    expect(remote.aliasTargetsByNormalizedName.get('grid')).toEqual(['Row', 'Col'])
    expect([...remote.allowedReferencePaths].sort()).toEqual(
      [...local.allowedReferencePaths].sort()
    )
  })

  it('routes component bundles and truncates snippets over HTTP', async () => {
    const index = await loadSkillIndex({ baseUrl })
    const result = await getTigercatComponent(index, {
      component: 'Button',
      framework: 'react',
      maxBytes: 300
    })

    expect(result.found).toBe(true)
    expect(result.matches[0].component.name).toBe('Button')
    expect(result.matches[0].sources.map((source) => source.path)).toEqual(
      expect.arrayContaining([
        'skills/tigercat/references/component-index.md',
        'skills/tigercat/references/shared/props/basic.md',
        'skills/tigercat/references/examples/basic.md',
        'skills/tigercat/references/react/index.md',
        'skills/tigercat/references/shared/patterns/common.md'
      ])
    )

    const truncated = result.matches[0].sources.find((source) => source.truncated)
    expect(truncated).toBeDefined()
    expect(Buffer.byteLength(truncated?.text ?? '', 'utf8')).toBeLessThanOrEqual(300)
  })

  it('rejects parent segments and non-allow-listed paths without fetching', async () => {
    const index = await loadSkillIndex({ baseUrl })

    await expect(readReferenceSource(index, '../package.json', 'test')).rejects.toThrow(
      'parent segments'
    )
    await expect(readReferenceSource(index, 'docs/MIGRATION.md', 'test')).rejects.toThrow(
      'not allowed'
    )
  })

  it('reports HTTP failures with the URL and local/mirror hints', async () => {
    const path = 'skills/tigercat/references/theme.md'
    skillServer.failPaths.add(path)
    try {
      const index = await loadSkillIndex({ baseUrl })
      const error: unknown = await readReferenceSource(index, path, 'test').catch(
        (caught: unknown) => caught
      )

      expect(error).toBeInstanceOf(Error)
      const message = (error as Error).message
      expect(message).toContain('HTTP 404')
      expect(message).toContain(`${baseUrl}${path}`)
      expect(message).toContain('--root')
      expect(message).toContain('--base-url')
    } finally {
      skillServer.failPaths.delete(path)
    }
  })

  it('fails fast with a fetch hint when the base URL is unreachable', async () => {
    const closed = createServer(() => {})
    const closedUrl = await listen(closed)
    await close(closed)

    const error: unknown = await loadSkillIndex({ baseUrl: closedUrl, timeoutMs: 500 }).catch(
      (caught: unknown) => caught
    )

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toContain('Failed to fetch Tigercat skill source')
    expect((error as Error).message).toContain('--base-url')
  })

  it('diagnoses remote sources and reports the deployed version', async () => {
    skillServer.overrides.set('version.json', JSON.stringify({ version: '9.9.9-test' }))
    try {
      const result = await diagnoseTigercatMcp({ baseUrl })

      expect(result.ok).toBe(true)
      expect(result.mode).toBe('http')
      expect(result.issues).toEqual([])
      expect(result.readableReferenceCount).toBeGreaterThanOrEqual(30)
      expect(result.remoteVersion).toBe('9.9.9-test')
    } finally {
      skillServer.overrides.delete('version.json')
    }
  }, 15_000)

  it('normalizes a subpath base URL without a trailing slash (Pages-like layout)', async () => {
    const prefixed = createSkillServer(root, 'mcp/')
    const prefixedUrl = await listen(prefixed.server)
    try {
      const index = await loadSkillIndex({ baseUrl: `${prefixedUrl}mcp` })

      expect(index.root).toBe(`${prefixedUrl}mcp/`)
      expect(index.components.size).toBe(149)
    } finally {
      await close(prefixed.server)
    }
  })
})

describe('Tigercat MCP stdio server (remote mode)', () => {
  it('serves tools over stdio with --base-url and doctors via the env fallback', async () => {
    const serverPath = resolve(root, 'packages/mcp/dist/index.js')
    if (!existsSync(serverPath)) {
      return
    }

    const doctor = await execFileAsync(process.execPath, [serverPath, '--doctor'], {
      timeout: 15_000,
      env: { ...process.env, TIGERCAT_MCP_BASE_URL: baseUrl }
    })
    expect(doctor.stdout).toContain('Tigercat MCP doctor: ok')
    expect(doctor.stdout).toContain('mode: remote')
    expect(doctor.stdout).toContain(baseUrl)

    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [serverPath, '--base-url', baseUrl]
    })
    const client = new Client({
      name: 'tigercat-mcp-remote-test',
      version: '0.0.0'
    })

    try {
      await client.connect(transport)

      const tools = await client.listTools()
      expect(tools.tools.map((tool) => tool.name)).toEqual(
        expect.arrayContaining([
          'tigercat_search',
          'tigercat_component',
          'tigercat_route',
          'tigercat_reference'
        ])
      )

      const lookup = await client.callTool({
        name: 'tigercat_component',
        arguments: { component: 'Grid', framework: 'react', maxBytes: 500 }
      })
      expect(lookup.isError).not.toBe(true)
      expect(
        JSON.parse(String(lookup.content[0].text)).matches.map((match) => match.component.name)
      ).toEqual(['Row', 'Col'])

      const blocked = await client.callTool({
        name: 'tigercat_reference',
        arguments: { path: '../package.json' }
      })
      expect(blocked.isError).toBe(true)
      expect(JSON.parse(String(blocked.content[0].text)).error).toContain('parent segments')
    } finally {
      await client.close()
    }
  }, 30_000)
})

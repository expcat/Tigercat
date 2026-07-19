import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { resolve } from 'node:path'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import {
  diagnoseTigercatMcp,
  getTigercatComponent,
  loadSkillIndex,
  routeTigercatTask,
  searchTigercat
} from '@expcat/tigercat-mcp'

const execFileAsync = promisify(execFile)
const root = process.cwd()

describe('Tigercat MCP generated inventory', () => {
  it('loads every public component from generated context7 metadata', async () => {
    const index = await loadSkillIndex(root)

    expect(index.context7.generated_by).toBe('pnpm docs:api')
    expect(index.context7.component_count).toBe(152)
    expect(index.components.size).toBe(152)
    expect(index.components.has('ConfigProvider')).toBe(true)
    expect(index.components.has('DataTableWithToolbar')).toBe(true)
    expect(index.components.has('Notification')).toBe(false)
    expect(index.components.has('Grid')).toBe(false)
    expect(index.aliasTargetsByNormalizedName.get('grid')).toEqual(['Row', 'Col'])
  })

  it('diagnoses readable references and generated route consistency', async () => {
    const result = await diagnoseTigercatMcp(root)

    expect(result.ok).toBe(true)
    expect(result.componentCount).toBe(152)
    expect(result.aliasCount).toBeGreaterThanOrEqual(1)
    expect(result.topicCount).toBeGreaterThanOrEqual(10)
    expect(result.issues).toEqual([])
  })
})

describe('Tigercat MCP routing API', () => {
  it('returns an exact component bundle with imports, refs, examples, and React notes', async () => {
    const index = await loadSkillIndex(root)
    const result = await getTigercatComponent(index, {
      component: 'Button',
      framework: 'react',
      maxBytes: 800
    })

    expect(result.found).toBe(true)
    expect(result.matches[0].component.name).toBe('Button')
    expect(result.matches[0].component.category).toBe('Basic')
    expect(result.matches[0].component.packageSubpath).toBe('./Button')
    expect(result.matches[0].sources.map((source) => source.path)).toEqual(
      expect.arrayContaining([
        'skills/tigercat/references/component-index.md',
        'skills/tigercat/references/shared/props/basic.md',
        'skills/tigercat/references/examples/basic.md',
        'skills/tigercat/references/react/index.md',
        'skills/tigercat/references/shared/patterns/common.md'
      ])
    )
  })

  it('routes Grid alias to Row and Col component bundles', async () => {
    const index = await loadSkillIndex(root)
    const result = await getTigercatComponent(index, {
      component: 'Grid',
      maxBytes: 600
    })

    expect(result.found).toBe(true)
    expect(result.matches.map((match) => match.component.name)).toEqual(['Row', 'Col'])
    expect(result.matches.every((match) => match.component.category === 'Layout')).toBe(true)
  })

  it('searches components, categories, aliases, and command API topics', async () => {
    const index = await loadSkillIndex(root)
    const component = await searchTigercat(index, { query: 'button' })
    const alias = await searchTigercat(index, { query: 'grid' })
    const command = await searchTigercat(index, { query: 'notification toast' })

    expect(component.results[0].name).toBe('Button')
    expect(alias.results.some((result) => result.kind === 'alias')).toBe(true)
    expect(command.results.some((result) => result.kind === 'command')).toBe(true)
  })

  it('routes component and topic tasks to minimal reference sources', async () => {
    const index = await loadSkillIndex(root)
    const result = await routeTigercatTask(index, {
      task: 'Need SSR theme i18n and a11y guidance for Button in an app shell',
      framework: 'vue',
      maxBytes: 600
    })

    expect(result.intent).toBe('mixed')
    expect(result.matches.map((match) => match.component.name)).toContain('Button')
    expect(result.topics.map((topic) => topic.slug)).toEqual(
      expect.arrayContaining(['ssr', 'theme', 'i18n', 'accessibility', 'app'])
    )
    expect(result.sources.map((source) => source.path)).toEqual(
      expect.arrayContaining([
        'skills/tigercat/references/shared/props/basic.md',
        'skills/tigercat/references/vue/index.md',
        'skills/tigercat/references/ssr.md',
        'skills/tigercat/references/theme.md'
      ])
    )
  })

  it('keeps unknown tasks as unknown and returns search candidates', async () => {
    const index = await loadSkillIndex(root)
    const result = await routeTigercatTask(index, {
      task: 'zzzz yyyy qqqq',
      maxBytes: 600
    })

    expect(result.intent).toBe('unknown')
    expect(result.matches).toEqual([])
    expect(result.topics).toEqual([])
    expect(result.sources.map((source) => source.path)).toEqual(['skills/tigercat/SKILL.md'])
  })

  it('truncates reference snippets and marks their source', async () => {
    const index = await loadSkillIndex(root)
    const result = await getTigercatComponent(index, {
      component: 'Button',
      framework: 'react',
      maxBytes: 300
    })

    const truncated = result.matches[0].sources.find((source) => source.truncated)
    expect(truncated).toBeDefined()
    expect(Buffer.byteLength(truncated?.text ?? '', 'utf8')).toBeLessThanOrEqual(300)
  })
})

describe('Tigercat MCP stdio server', () => {
  it('exposes redesigned tools, resources, prompts, doctor, and guarded reads from the built binary', async () => {
    const serverPath = resolve(root, 'packages/mcp/dist/index.js')
    if (!existsSync(serverPath)) {
      return
    }

    const doctor = await execFileAsync(process.execPath, [serverPath, '--root', root, '--doctor'], {
      timeout: 10_000
    })
    expect(doctor.stdout).toContain('Tigercat MCP doctor: ok')

    const transport = new StdioClientTransport({
      command: process.execPath,
      args: [serverPath, '--root', root]
    })
    const client = new Client({
      name: 'tigercat-mcp-test',
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
      expect(tools.tools.map((tool) => tool.name)).not.toContain('tigercat_lookup_component')

      const resources = await client.listResources()
      expect(resources.resources.map((resource) => resource.uri)).toContain('tigercat://inventory')

      const templates = await client.listResourceTemplates()
      expect(templates.resourceTemplates.map((template) => template.uriTemplate)).toEqual(
        expect.arrayContaining([
          'tigercat://component/{name}',
          'tigercat://category/{slug}',
          'tigercat://topic/{topic}',
          'tigercat://reference/{path}'
        ])
      )

      const prompts = await client.listPrompts()
      expect(prompts.prompts.map((prompt) => prompt.name)).toContain('tigercat-usage')

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
  })
})

import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { loadSkillIndex, lookupTigercatComponent, routeTigercatTask } from '@expcat/tigercat-mcp'

const root = process.cwd()

describe('Tigercat MCP skill routing', () => {
  it('routes Button React usage to basic props, examples, React notes, and patterns', async () => {
    const index = await loadSkillIndex(root)
    const result = await lookupTigercatComponent(index, {
      component: 'button',
      framework: 'react',
      maxBytes: 800
    })

    expect(result.found).toBe(true)
    expect(result.matches[0].component).toBe('Button')
    expect(result.matches[0].category).toBe('Basic')
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

  it('routes Table and VirtualTable as separate data and advanced component matches', async () => {
    const index = await loadSkillIndex(root)
    const result = await lookupTigercatComponent(index, {
      component: 'Table/VirtualTable',
      maxBytes: 800
    })

    expect(result.found).toBe(true)
    expect(result.matches.map((match) => [match.component, match.category])).toEqual(
      expect.arrayContaining([
        ['VirtualTable', 'Advanced'],
        ['Table', 'Data']
      ])
    )
    expect(result.matches.flatMap((match) => match.sources.map((source) => source.path))).toEqual(
      expect.arrayContaining([
        'skills/tigercat/references/shared/props/data.md',
        'skills/tigercat/references/shared/props/advanced.md'
      ])
    )
  })

  it('routes SSR, theme, i18n, and a11y tasks to hand-written references', async () => {
    const index = await loadSkillIndex(root)
    const result = await routeTigercatTask(index, {
      task: 'Need SSR theme i18n and a11y guidance for an app shell',
      maxBytes: 600
    })

    expect(result.intent).toBe('topic')
    expect(result.sources.map((source) => source.path)).toEqual(
      expect.arrayContaining([
        'skills/tigercat/SKILL.md',
        'skills/tigercat/references/ssr.md',
        'skills/tigercat/references/theme.md',
        'skills/tigercat/references/i18n.md',
        'skills/tigercat/references/accessibility.md',
        'skills/tigercat/references/recipes/building-apps.md'
      ])
    )
  })

  it('returns candidates for unknown component lookups without guessing', async () => {
    const index = await loadSkillIndex(root)
    const result = await lookupTigercatComponent(index, {
      component: 'But',
      framework: 'vue'
    })

    expect(result.found).toBe(false)
    expect(result.matches).toEqual([])
    expect(result.candidates).toContain('Button')
  })

  it('keeps unknown non-component tasks as unknown and falls back to the skill index', async () => {
    const index = await loadSkillIndex(root)
    const result = await routeTigercatTask(index, {
      task: 'zzzz yyyy qqqq',
      maxBytes: 600
    })

    expect(result.intent).toBe('unknown')
    expect(result.sources.map((source) => source.path)).toEqual(['skills/tigercat/SKILL.md'])
  })

  it('truncates reference snippets and marks their source', async () => {
    const index = await loadSkillIndex(root)
    const result = await lookupTigercatComponent(index, {
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
  it('exposes tools, resources, prompts, and guarded reads from the built binary', async () => {
    const serverPath = resolve(root, 'packages/mcp/dist/index.js')
    if (!existsSync(serverPath)) {
      return
    }

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
          'tigercat_route_task',
          'tigercat_lookup_component',
          'tigercat_read_reference'
        ])
      )

      const resources = await client.listResources()
      expect(resources.resources.map((resource) => resource.uri)).toEqual(
        expect.arrayContaining(['tigercat://skill/index', 'tigercat://context7'])
      )

      const prompts = await client.listPrompts()
      expect(prompts.prompts.map((prompt) => prompt.name)).toContain('tigercat-component-usage')

      const lookup = await client.callTool({
        name: 'tigercat_lookup_component',
        arguments: { component: 'Button', framework: 'react', maxBytes: 500 }
      })
      expect(lookup.isError).not.toBe(true)
      expect(JSON.parse(String(lookup.content[0].text)).matches[0].component).toBe('Button')

      const blocked = await client.callTool({
        name: 'tigercat_read_reference',
        arguments: { path: '../package.json' }
      })
      expect(blocked.isError).toBe(true)
      expect(JSON.parse(String(blocked.content[0].text)).error).toContain('parent segments')
    } finally {
      await client.close()
    }
  })
})

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js'

import { loadSkillIndex, readReferenceSource } from './skill-index'
import { PACKAGE_VERSION } from './version'
import {
  createTopicRoute,
  getCategoryComponents,
  getInventory,
  getTigercatComponent,
  routeTigercatTask,
  searchTigercat
} from './router'
import type { SkillIndex, TigercatFramework, TigercatMcpOptions } from './types'

const JSON_MIME = 'application/json'
const MARKDOWN_MIME = 'text/markdown'

// 注入到 MCP 客户端系统提示的服务器级指令:工具优先级、成本模型与中文任务
// 提示都放在这里,而不是只写在装了 Skill 的用户才看得到的 SKILL.md 里。
export const TIGERCAT_SERVER_INSTRUCTIONS = [
  'Tigercat is a Tailwind CSS React + Vue 3 UI library (152 components, imported from',
  '@expcat/tigercat-react / @expcat/tigercat-vue PascalCase subpaths such as',
  '@expcat/tigercat-react/Button). Use this server BEFORE writing or reviewing any code',
  'that touches Tigercat — it returns exact import subpaths, props/events, and',
  'per-framework binding notes that differ from generic React/Vue knowledge.',
  '',
  'Tool order: call `tigercat_route` first for any natural-language task (always pass',
  '`framework`; it roughly halves the payload). Call `tigercat_component` when you',
  'already know the component name or alias. Use `tigercat_search` only for fuzzy',
  'discovery, and `tigercat_reference` only to read a path that a previous result',
  'pointed to.',
  '',
  'Responses inline the needed reference text once, as extra content blocks after the',
  'JSON summary. Sources marked `"inlined": false` are session-level background',
  '(inventory, glossary, patterns): read each at most once per session via',
  '`tigercat_reference`, and only if actually needed. Do not re-read paths you already',
  'received.',
  '',
  'Component matching works with English names and listed Chinese aliases (e.g. 表单,',
  '日期选择器); prefer English component names for precision. `notification` is a',
  'command API topic, not a component; `Message` is both.'
].join('\n')

const FRAMEWORK_SCHEMA = {
  type: 'string',
  enum: ['react', 'vue'],
  description: 'Target framework. Omit to receive notes for both React and Vue (larger payload).'
} as const

const MAX_BYTES_SCHEMA = {
  type: 'number',
  minimum: 200,
  maximum: 50000,
  description:
    'Byte cap per inlined source (default 12000). Raise only when a source was truncated.'
} as const

export const TIGERCAT_TOOLS = [
  {
    name: 'tigercat_search',
    description:
      'Fuzzy-search Tigercat components, aliases, categories, topics, and command APIs. ' +
      'Returns ranked name/metadata matches only — no reference text, cheapest call. ' +
      'Use when unsure of the exact name; otherwise go straight to tigercat_component or tigercat_route.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Component, alias, category, topic, or use case, e.g. "table" or "表格".'
        },
        framework: FRAMEWORK_SCHEMA,
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 30,
          description: 'Max results (default 8).'
        }
      },
      required: ['query'],
      additionalProperties: false
    }
  },
  {
    name: 'tigercat_component',
    description:
      'Look up one Tigercat component by exact name or alias (e.g. Button, Grid, 日期选择器). ' +
      'Returns its import subpath, its own props/events section, compact category examples, and ' +
      'framework binding notes, inlined as content blocks after the JSON summary. ' +
      'Preferred over tigercat_route when you already know the component name; pass framework to shrink the payload.',
    inputSchema: {
      type: 'object',
      properties: {
        component: {
          type: 'string',
          description: 'Component name or alias, such as Button, Grid, or 表格.'
        },
        framework: FRAMEWORK_SCHEMA,
        maxBytes: MAX_BYTES_SCHEMA
      },
      required: ['component'],
      additionalProperties: false
    }
  },
  {
    name: 'tigercat_route',
    description:
      'Route a natural-language Tigercat task to the smallest useful component/topic references. ' +
      'Preferred FIRST call for any Tigercat coding task. Returns matched components with import ' +
      'paths plus each needed reference inlined exactly once; sources marked "inlined": false are ' +
      'session-level background to read at most once via tigercat_reference. Always pass framework. ' +
      'Name components in English or a listed Chinese alias.',
    inputSchema: {
      type: 'object',
      properties: {
        task: {
          type: 'string',
          description:
            'Natural-language Tigercat task, e.g. "add a DatePicker with Form validation" or "给表单加日期选择器".'
        },
        framework: FRAMEWORK_SCHEMA,
        maxBytes: MAX_BYTES_SCHEMA,
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 30,
          description: 'Max fallback candidates when nothing matches directly (default 8).'
        }
      },
      required: ['task'],
      additionalProperties: false
    }
  },
  {
    name: 'tigercat_reference',
    description:
      'Read one allow-listed Tigercat skill reference file verbatim. Use only for paths returned ' +
      'by other tigercat tools — typically to read an "inlined": false pointer source once per session.',
    inputSchema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description:
            'Repo-relative path under skills/tigercat/, exactly as returned in a source "path" field, ' +
            'e.g. skills/tigercat/references/shared/glossary.md.'
        },
        maxBytes: MAX_BYTES_SCHEMA
      },
      required: ['path'],
      additionalProperties: false
    }
  }
] as const

export function createTigercatMcpServer(options: TigercatMcpOptions = {}): Server {
  const server = new Server(
    {
      name: '@expcat/tigercat-mcp',
      version: PACKAGE_VERSION
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {}
      },
      instructions: TIGERCAT_SERVER_INSTRUCTIONS
    }
  )

  let indexPromise: Promise<SkillIndex> | undefined
  const getIndex = () => {
    indexPromise ??= loadSkillIndex(options)
    return indexPromise
  }

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TIGERCAT_TOOLS }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const index = await getIndex()
    const args = (request.params.arguments ?? {}) as Record<string, unknown>

    try {
      if (request.params.name === 'tigercat_search') {
        return renderToolResult(
          await searchTigercat(index, {
            query: stringArg(args.query),
            framework: frameworkArg(args.framework),
            limit: numberArg(args.limit)
          })
        )
      }

      if (request.params.name === 'tigercat_component') {
        return renderToolResult(
          await getTigercatComponent(index, {
            component: stringArg(args.component),
            framework: frameworkArg(args.framework),
            maxBytes: numberArg(args.maxBytes)
          })
        )
      }

      if (request.params.name === 'tigercat_route') {
        return renderToolResult(
          await routeTigercatTask(index, {
            task: stringArg(args.task),
            framework: frameworkArg(args.framework),
            maxBytes: numberArg(args.maxBytes),
            limit: numberArg(args.limit)
          })
        )
      }

      if (request.params.name === 'tigercat_reference') {
        return renderToolResult(
          await readReferenceSource(
            index,
            stringArg(args.path),
            'Direct allow-listed skill reference read.',
            numberArg(args.maxBytes)
          )
        )
      }

      throw new Error(`Unknown Tigercat MCP tool: ${request.params.name}`)
    } catch (error) {
      return jsonContent({ error: formatError(error) }, true)
    }
  })

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: 'tigercat://inventory',
        name: 'Tigercat inventory',
        description: 'Generated component, alias, category, and topic inventory.',
        mimeType: JSON_MIME
      }
    ]
  }))

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: [
      {
        uriTemplate: 'tigercat://component/{name}',
        name: 'Tigercat component bundle',
        description: 'Component metadata plus props/examples/framework reference bundle.',
        mimeType: JSON_MIME
      },
      {
        uriTemplate: 'tigercat://category/{slug}',
        name: 'Tigercat category inventory',
        description: 'Components in a generated component category.',
        mimeType: JSON_MIME
      },
      {
        uriTemplate: 'tigercat://topic/{topic}',
        name: 'Tigercat topic bundle',
        description: 'Hand-written topic route plus reference snippets.',
        mimeType: JSON_MIME
      },
      {
        uriTemplate: 'tigercat://reference/{path}',
        name: 'Tigercat skill reference',
        description: 'Allow-listed skill reference content.',
        mimeType: MARKDOWN_MIME
      }
    ]
  }))

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const index = await getIndex()
    const uri = request.params.uri

    if (uri === 'tigercat://inventory') {
      return resourceText(uri, JSON.stringify(getInventory(index)), JSON_MIME)
    }

    if (uri.startsWith('tigercat://component/')) {
      const component = decodeURIComponent(uri.slice('tigercat://component/'.length))
      const lookup = await getTigercatComponent(index, { component })
      return resourceText(uri, JSON.stringify(lookup), JSON_MIME)
    }

    if (uri.startsWith('tigercat://category/')) {
      const category = decodeURIComponent(uri.slice('tigercat://category/'.length))
      const components = getCategoryComponents(index, category)
      return resourceText(uri, JSON.stringify({ category, components }), JSON_MIME)
    }

    if (uri.startsWith('tigercat://topic/')) {
      const topic = decodeURIComponent(uri.slice('tigercat://topic/'.length))
      const route = await createTopicRoute(index, topic)
      return resourceText(uri, JSON.stringify(route), JSON_MIME)
    }

    if (uri.startsWith('tigercat://reference/')) {
      const path = decodeURIComponent(uri.slice('tigercat://reference/'.length))
      const source = await readReferenceSource(index, path, 'Direct resource reference read.')
      return resourceText(uri, source.text ?? '', MARKDOWN_MIME)
    }

    throw new Error(`Unknown Tigercat MCP resource: ${uri}`)
  })

  server.setRequestHandler(ListPromptsRequestSchema, async () => ({
    prompts: [
      {
        name: 'tigercat-usage',
        description: 'Guide an LLM to route, read, and answer a Tigercat usage task.',
        arguments: [
          {
            name: 'task',
            description: 'Usage, migration, implementation, or debugging task.',
            required: true
          },
          {
            name: 'framework',
            description: 'Target framework: react or vue.',
            required: false
          }
        ]
      }
    ]
  }))

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    if (request.params.name !== 'tigercat-usage') {
      throw new Error(`Unknown Tigercat MCP prompt: ${request.params.name}`)
    }

    const args = request.params.arguments ?? {}
    const task = stringArg(args.task)
    const framework = optionalStringArg(args.framework) ?? 'react or vue'

    return {
      description: 'Route Tigercat usage references before answering.',
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `Use tigercat_route with framework "${framework}" before answering.`,
              'Use tigercat_component for exact component imports and props when route results mention components.',
              'Read only the returned sources; sources marked "inlined": false are optional background — fetch each at most once via tigercat_reference.',
              `Task: ${task}`,
              'Answer with exact import paths, key props/events, and React/Vue binding differences.'
            ].join('\n')
          }
        }
      ]
    }
  })

  return server
}

function jsonContent(value: unknown, isError = false) {
  return {
    isError,
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify(value)
      }
    ]
  }
}

// 工具结果渲染:reference 正文不进 JSON 字符串(转义+缩进膨胀 ~15%),而是紧随
// 紧凑 JSON 摘要之后,每份 source 一个原样 markdown content block。摘要里的
// source 以 {path, reason, inlined} 元数据出现;inlined=false 即指针。
export function renderToolResult(value: unknown) {
  const blocks: Array<{ type: 'text'; text: string }> = []
  const seen = new Set<string>()

  const visit = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(visit)
    if (!node || typeof node !== 'object') return node

    const record = node as Record<string, unknown>
    if (isReferenceSource(record)) {
      const { text, ...rest } = record
      if (typeof text !== 'string') return { ...rest, inlined: false }

      const section = typeof record.section === 'string' ? record.section : undefined
      const key = `${record.path}#${section ?? ''}`
      if (!seen.has(key)) {
        seen.add(key)
        blocks.push({
          type: 'text',
          text: formatSourceBlock(record.path, section, record.truncated, text)
        })
      }
      return { ...rest, inlined: true }
    }

    return Object.fromEntries(Object.entries(record).map(([k, v]) => [k, visit(v)]))
  }

  const summary = visit(value)

  return {
    isError: false,
    content: [{ type: 'text' as const, text: JSON.stringify(summary) }, ...blocks]
  }
}

function isReferenceSource(
  record: Record<string, unknown>
): record is Record<string, unknown> & { path: string; reason: string; truncated: boolean } {
  return (
    typeof record.path === 'string' &&
    typeof record.reason === 'string' &&
    typeof record.truncated === 'boolean'
  )
}

function formatSourceBlock(
  path: string,
  section: string | undefined,
  truncated: boolean,
  text: string
): string {
  const heading = section ? `${path} § ${section}` : path
  const truncatedNote = truncated ? ' [truncated: raise maxBytes to read more]' : ''
  return `===== source: ${heading}${truncatedNote} =====\n${text}`
}

function resourceText(uri: string, text: string, mimeType: string) {
  return {
    contents: [
      {
        uri,
        mimeType,
        text
      }
    ]
  }
}

function stringArg(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('Expected string argument')
  }
  return value
}

function optionalStringArg(value: unknown): string | undefined {
  if (value === undefined) return undefined
  return stringArg(value)
}

function frameworkArg(value: unknown): TigercatFramework | undefined {
  if (value === undefined) return undefined
  if (value === 'react' || value === 'vue') return value
  throw new Error('framework must be react or vue')
}

function numberArg(value: unknown): number | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'number') return value
  throw new Error('Expected number argument')
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

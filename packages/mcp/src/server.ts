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

export function createTigercatMcpServer(options: TigercatMcpOptions = {}): Server {
  const server = new Server(
    {
      name: '@expcat/tigercat-mcp',
      version: '2.0.0-rc.1'
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {}
      }
    }
  )

  let indexPromise: Promise<SkillIndex> | undefined
  const getIndex = () => {
    indexPromise ??= loadSkillIndex(options.root)
    return indexPromise
  }

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'tigercat_search',
        description: 'Search Tigercat components, aliases, categories, topics, and command APIs.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Component, alias, category, topic, or use case.'
            },
            framework: { type: 'string', enum: ['react', 'vue'] },
            limit: { type: 'number', minimum: 1, maximum: 30 }
          },
          required: ['query'],
          additionalProperties: false
        }
      },
      {
        name: 'tigercat_component',
        description:
          'Return exact Tigercat component metadata, import paths, docs, examples, and framework notes.',
        inputSchema: {
          type: 'object',
          properties: {
            component: {
              type: 'string',
              description: 'Component name or alias, such as Button or Grid.'
            },
            framework: { type: 'string', enum: ['react', 'vue'] },
            maxBytes: { type: 'number', minimum: 200, maximum: 50000 }
          },
          required: ['component'],
          additionalProperties: false
        }
      },
      {
        name: 'tigercat_route',
        description:
          'Route a natural-language Tigercat task to the smallest useful component/topic references.',
        inputSchema: {
          type: 'object',
          properties: {
            task: { type: 'string', description: 'Natural-language Tigercat task.' },
            framework: { type: 'string', enum: ['react', 'vue'] },
            maxBytes: { type: 'number', minimum: 200, maximum: 50000 },
            limit: { type: 'number', minimum: 1, maximum: 30 }
          },
          required: ['task'],
          additionalProperties: false
        }
      },
      {
        name: 'tigercat_reference',
        description: 'Read an allow-listed Tigercat skill reference with optional byte truncation.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'Repo-relative skill reference path under skills/tigercat.'
            },
            maxBytes: { type: 'number', minimum: 200, maximum: 50000 }
          },
          required: ['path'],
          additionalProperties: false
        }
      }
    ]
  }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const index = await getIndex()
    const args = (request.params.arguments ?? {}) as Record<string, unknown>

    try {
      if (request.params.name === 'tigercat_search') {
        return jsonContent(
          await searchTigercat(index, {
            query: stringArg(args.query),
            framework: frameworkArg(args.framework),
            limit: numberArg(args.limit)
          })
        )
      }

      if (request.params.name === 'tigercat_component') {
        return jsonContent(
          await getTigercatComponent(index, {
            component: stringArg(args.component),
            framework: frameworkArg(args.framework),
            maxBytes: numberArg(args.maxBytes)
          })
        )
      }

      if (request.params.name === 'tigercat_route') {
        return jsonContent(
          await routeTigercatTask(index, {
            task: stringArg(args.task),
            framework: frameworkArg(args.framework),
            maxBytes: numberArg(args.maxBytes),
            limit: numberArg(args.limit)
          })
        )
      }

      if (request.params.name === 'tigercat_reference') {
        return jsonContent(
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
      return resourceText(uri, JSON.stringify(getInventory(index), null, 2), JSON_MIME)
    }

    if (uri.startsWith('tigercat://component/')) {
      const component = decodeURIComponent(uri.slice('tigercat://component/'.length))
      const lookup = await getTigercatComponent(index, { component })
      return resourceText(uri, JSON.stringify(lookup, null, 2), JSON_MIME)
    }

    if (uri.startsWith('tigercat://category/')) {
      const category = decodeURIComponent(uri.slice('tigercat://category/'.length))
      const components = getCategoryComponents(index, category)
      return resourceText(uri, JSON.stringify({ category, components }, null, 2), JSON_MIME)
    }

    if (uri.startsWith('tigercat://topic/')) {
      const topic = decodeURIComponent(uri.slice('tigercat://topic/'.length))
      const route = await createTopicRoute(index, topic)
      return resourceText(uri, JSON.stringify(route, null, 2), JSON_MIME)
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
              'Read only the returned sources needed for the task.',
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
        text: JSON.stringify(value, null, 2)
      }
    ]
  }
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

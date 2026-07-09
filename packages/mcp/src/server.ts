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

import { loadSkillIndex, readContext7Source, readReferenceSource } from './skill-index'
import { lookupTigercatComponent, routeTigercatTask } from './router'
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
        name: 'tigercat_route_task',
        description:
          'Route a Tigercat task to the smallest useful skill references and context snippets.',
        inputSchema: {
          type: 'object',
          properties: {
            task: { type: 'string', description: 'Natural-language Tigercat task.' },
            framework: { type: 'string', enum: ['react', 'vue'] },
            maxBytes: { type: 'number', minimum: 200, maximum: 50000 }
          },
          required: ['task'],
          additionalProperties: false
        }
      },
      {
        name: 'tigercat_lookup_component',
        description:
          'Look up Tigercat component props/examples/framework references from context7.json.',
        inputSchema: {
          type: 'object',
          properties: {
            component: { type: 'string', description: 'Component name such as Button or Table.' },
            framework: { type: 'string', enum: ['react', 'vue'] },
            task: { type: 'string', description: 'Optional task context.' },
            maxBytes: { type: 'number', minimum: 200, maximum: 50000 }
          },
          required: ['component'],
          additionalProperties: false
        }
      },
      {
        name: 'tigercat_read_reference',
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
      if (request.params.name === 'tigercat_route_task') {
        return jsonContent(
          await routeTigercatTask(index, {
            task: stringArg(args.task),
            framework: frameworkArg(args.framework),
            maxBytes: numberArg(args.maxBytes)
          })
        )
      }

      if (request.params.name === 'tigercat_lookup_component') {
        return jsonContent(
          await lookupTigercatComponent(index, {
            component: stringArg(args.component),
            framework: frameworkArg(args.framework),
            task: optionalStringArg(args.task),
            maxBytes: numberArg(args.maxBytes)
          })
        )
      }

      if (request.params.name === 'tigercat_read_reference') {
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
        uri: 'tigercat://skill/index',
        name: 'Tigercat skill index',
        description: 'Top-level Tigercat skill route index.',
        mimeType: MARKDOWN_MIME
      },
      {
        uri: 'tigercat://context7',
        name: 'Tigercat Context7 route map',
        description: 'Component-to-reference route map consumed by the MCP server.',
        mimeType: JSON_MIME
      }
    ]
  }))

  server.setRequestHandler(ListResourceTemplatesRequestSchema, async () => ({
    resourceTemplates: [
      {
        uriTemplate: 'tigercat://component/{name}',
        name: 'Tigercat component route',
        description: 'Component-specific props/examples/framework route bundle.',
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

    if (uri === 'tigercat://skill/index') {
      const source = await readReferenceSource(
        index,
        'skills/tigercat/SKILL.md',
        'Top-level skill route index.'
      )
      return resourceText(uri, source.text ?? '', MARKDOWN_MIME)
    }

    if (uri === 'tigercat://context7') {
      const source = await readContext7Source(index)
      return resourceText(uri, source.text ?? '', JSON_MIME)
    }

    if (uri.startsWith('tigercat://component/')) {
      const component = decodeURIComponent(uri.slice('tigercat://component/'.length))
      const lookup = await lookupTigercatComponent(index, { component })
      return resourceText(uri, JSON.stringify(lookup, null, 2), JSON_MIME)
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
        name: 'tigercat-component-usage',
        description: 'Guide an LLM to route, read, and answer a Tigercat component usage task.',
        arguments: [
          {
            name: 'component',
            description: 'Tigercat component name.',
            required: true
          },
          {
            name: 'framework',
            description: 'Target framework: react or vue.',
            required: false
          },
          {
            name: 'task',
            description: 'Usage, migration, or implementation task.',
            required: false
          }
        ]
      }
    ]
  }))

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    if (request.params.name !== 'tigercat-component-usage') {
      throw new Error(`Unknown Tigercat MCP prompt: ${request.params.name}`)
    }

    const args = request.params.arguments ?? {}
    const component = stringArg(args.component)
    const framework = optionalStringArg(args.framework) ?? 'react or vue'
    const task = optionalStringArg(args.task) ?? 'explain correct usage with minimal context'

    return {
      description: `Route Tigercat ${component} usage references before answering.`,
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `Use tigercat_lookup_component for ${component} with framework "${framework}".`,
              'Read only the returned sources needed for the task.',
              `Task: ${task}`,
              'Answer with exact import paths, key props/events, and any React/Vue binding differences.'
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

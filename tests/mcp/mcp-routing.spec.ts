import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

import {
  extractMarkdownSection,
  loadSkillIndex,
  normalizeName
} from '../../packages/mcp/src/skill-index'
import {
  getTigercatComponent,
  routeTigercatTask,
  searchTigercat
} from '../../packages/mcp/src/router'
import {
  renderToolResult,
  TIGERCAT_SERVER_INSTRUCTIONS,
  TIGERCAT_TOOLS
} from '../../packages/mcp/src/server'
import type { SkillIndex } from '../../packages/mcp/src/types'

// vitest 统一从仓库根运行(vitest.config.ts 在根目录)。
const REPO_ROOT = process.cwd()

// 响应体积预算:回归到旧的整文件打包行为(单组件 ~37K、双组件 route ~116K)时必须报红。
const COMPONENT_BUDGET_CHARS = 10_000
const ROUTE_BUDGET_CHARS = 24_000

let index: SkillIndex

beforeAll(async () => {
  index = await loadSkillIndex(REPO_ROOT)
})

describe('normalizeName', () => {
  it('keeps CJK characters so Chinese aliases survive normalization', () => {
    expect(normalizeName('日期选择器')).toBe('日期选择器')
    expect(normalizeName('DatePicker')).toBe('datepicker')
    expect(normalizeName('表单 校验!')).toBe('表单校验')
  })
})

describe('extractMarkdownSection', () => {
  it('extracts exactly one `## Name` section', () => {
    const text = '# T\n\n## Button\n\nbody-a\n\n## ButtonGroup\n\nbody-b\n'
    expect(extractMarkdownSection(text, 'Button')).toBe('## Button\n\nbody-a\n')
    expect(extractMarkdownSection(text, 'ButtonGroup')).toBe('## ButtonGroup\n\nbody-b\n')
    expect(extractMarkdownSection(text, 'Missing')).toBeUndefined()
  })

  it('finds a props section for every indexed component (truncation regression)', async () => {
    const missing: string[] = []
    const cache = new Map<string, string>()

    for (const component of index.components.values()) {
      const path = component.references.props
      let text = cache.get(path)
      if (text === undefined) {
        text = await readFile(join(REPO_ROOT, path), 'utf8')
        cache.set(path, text)
      }
      if (extractMarkdownSection(text, component.name) === undefined) {
        missing.push(`${component.name} (${path})`)
      }
    }

    expect(missing).toEqual([])
  })
})

describe('getTigercatComponent', () => {
  it('returns the requested component own props section, within budget', async () => {
    // Tag 的 props 落在 basic 分类文件 12KB 截断线之后,旧实现会把它整段切丢。
    const result = await getTigercatComponent(index, { component: 'Tag', framework: 'react' })

    expect(result.found).toBe(true)
    const propsSource = result.matches[0].sources.find((source) => source.section === 'Tag')
    expect(propsSource?.text).toContain('TagProps')
    expect(propsSource?.truncated).toBe(false)
    expect(JSON.stringify(result).length).toBeLessThan(COMPONENT_BUDGET_CHARS)
  })

  it('downgrades session-level shared docs to pointers without text', async () => {
    const result = await getTigercatComponent(index, { component: 'Button', framework: 'react' })
    const sources = result.matches[0].sources

    const pointerPaths = sources.filter((source) => source.text === undefined).map((s) => s.path)
    expect(pointerPaths).toContain('skills/tigercat/references/component-index.md')
    expect(pointerPaths).toContain('skills/tigercat/references/shared/patterns/common.md')
    expect(pointerPaths).toContain('skills/tigercat/references/shared/glossary.md')
  })

  it('resolves Chinese aliases', async () => {
    const result = await getTigercatComponent(index, { component: '日期选择' })
    expect(result.found).toBe(true)
    expect(result.matches.map((match) => match.component.name)).toContain('DatePicker')
  })
})

describe('routeTigercatTask', () => {
  it('routes an English task within budget and inlines each source only once', async () => {
    const result = await routeTigercatTask(index, {
      task: 'add a DatePicker with Form validation',
      framework: 'react'
    })

    expect(result.intent).toBe('component')
    const names = result.matches.map((match) => match.component.name)
    expect(names).toContain('DatePicker')
    expect(names).toContain('Form')

    // 正文只允许出现在顶层 sources;matches 里只留元数据,否则同一正文双份内联。
    for (const match of result.matches) {
      for (const source of match.sources) {
        expect(source.text).toBeUndefined()
      }
    }
    expect(result.sources.some((source) => typeof source.text === 'string')).toBe(true)

    // 同分类不同组件的 props 小节都要在(dedupe 键必须含 section)。
    const sections = result.sources.map((source) => source.section).filter(Boolean)
    expect(sections).toContain('DatePicker')
    expect(sections).toContain('Form')

    expect(JSON.stringify(result).length).toBeLessThan(ROUTE_BUDGET_CHARS)
  })

  it('routes a Chinese task to the same components', async () => {
    const result = await routeTigercatTask(index, {
      task: '给表单加一个带校验的日期选择器',
      framework: 'react'
    })

    expect(result.intent).toBe('component')
    const names = result.matches.map((match) => match.component.name)
    expect(names).toContain('DatePicker')
    expect(names).toContain('Form')
  })

  it('falls back to the skill index for unroutable tasks', async () => {
    const result = await routeTigercatTask(index, { task: 'zzz nothing matches here' })

    expect(result.intent).toBe('unknown')
    const fallback = result.sources.find((source) => source.path.endsWith('SKILL.md'))
    expect(fallback?.text).toContain('Tigercat')
  })
})

describe('searchTigercat', () => {
  it('matches Chinese alias queries', async () => {
    const result = await searchTigercat(index, { query: '表格' })
    expect(result.results.length).toBeGreaterThan(0)
    expect(result.results[0].kind).toBe('alias')
  })
})

describe('server surface', () => {
  it('exposes server instructions covering tool order and cost model', () => {
    expect(TIGERCAT_SERVER_INSTRUCTIONS).toContain('tigercat_route')
    expect(TIGERCAT_SERVER_INSTRUCTIONS).toContain('at most once per session')
    expect(TIGERCAT_SERVER_INSTRUCTIONS).toContain('framework')
  })

  it('describes every tool with usage guidance', () => {
    expect(TIGERCAT_TOOLS.map((tool) => tool.name)).toEqual([
      'tigercat_search',
      'tigercat_component',
      'tigercat_route',
      'tigercat_reference'
    ])
    for (const tool of TIGERCAT_TOOLS) {
      expect(tool.description.length).toBeGreaterThan(80)
    }
  })

  it('renders sources as separate raw-markdown blocks with inlined flags', async () => {
    const lookup = await getTigercatComponent(index, { component: 'Tag', framework: 'react' })
    const rendered = renderToolResult(lookup)

    const [summary, ...blocks] = rendered.content
    expect(blocks.length).toBeGreaterThan(0)

    // 摘要 JSON 不携带正文,inlined 标记区分内联块与会话级指针。
    const parsed = JSON.parse(summary.text) as {
      matches: Array<{ sources: Array<{ text?: string; inlined: boolean }> }>
    }
    for (const source of parsed.matches[0].sources) {
      expect(source.text).toBeUndefined()
      expect(typeof source.inlined).toBe('boolean')
    }
    expect(parsed.matches[0].sources.some((source) => source.inlined)).toBe(true)
    expect(parsed.matches[0].sources.some((source) => !source.inlined)).toBe(true)

    const tagBlock = blocks.find((block) => block.text.includes('§ Tag'))
    expect(tagBlock?.text).toContain('TagProps')
    expect(tagBlock?.text.startsWith('===== source:')).toBe(true)
  })
})

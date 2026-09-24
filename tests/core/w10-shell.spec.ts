/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  queryScalarsForLocalView,
  summarizeQueryValues,
  submitWorkflowDetailAction
} from '@expcat/tigercat-core'
import { planMigrate, rewriteSource } from '@expcat/tigercat-cli/commands/migrate'
import { getVue3Template } from '@expcat/tigercat-cli/templates/vue3'

describe('W10 shell and publish', () => {
  it('rewrites deleted import names and specifiers only', () => {
    const source = `import { Kanban, Button } from '@expcat/tigercat-vue/Kanban'
import { x } from '@expcat/tigercat-core/datepicker-locales/zh-CN'
const props = { Kanban: true }
`
    const next = rewriteSource(source)
    expect(next).toContain('TaskBoard')
    expect(next).toContain('@expcat/tigercat-vue/TaskBoard')
    expect(next).toContain('@expcat/tigercat-core/locales/zh-CN')
    expect(next).toContain('const props = { Kanban: true }')
  })

  it('previews migrate files and writes only with the planner output', () => {
    const dir = mkdtempSync(join(tmpdir(), 'w10-migrate-'))
    mkdirSync(join(dir, 'src'))
    const file = join(dir, 'src', 'page.ts')
    writeFileSync(file, `import { DonutChart } from '@expcat/tigercat-react'\n`)
    const planned = planMigrate(dir)
    expect(planned).toHaveLength(1)
    expect(readFileSync(file, 'utf8')).toContain('DonutChart')
    writeFileSync(planned[0].file, planned[0].next)
    expect(readFileSync(file, 'utf8')).toContain('PieChart')
  })

  it('creates a shell preset that references AppShell and a static route table', () => {
    const files = getVue3Template('demo', 'shell')
    expect(files['src/App.vue']).toContain('AppShell')
    expect(files['src/routes.ts']).toContain("title: 'Home'")
    expect(files['src/style.css']).toContain('@plugin "@expcat/tigercat-core/tailwind"')
  })

  it('submits detail values and the action together', () => {
    const instance = { steps: [] }
    const result = submitWorkflowDetailAction({
      original: { secret: 'keep' },
      submitted: { secret: 'changed', note: 'hi' },
      instance,
      action: { action: 'approve', actorId: 'ada', comment: 'ok' }
    })
    expect(result.values).toEqual({ secret: 'keep' })
    expect(result.instance).toBe(instance)
  })

  it('summarizes query values and skips objects in the local view', () => {
    const fields = [
      { key: 'name', label: 'Name' },
      { key: 'range', label: 'Range' }
    ]
    const values = { name: 'Ada', range: { start: '2024-01-01' } }
    expect(summarizeQueryValues(fields, values)).toBe('Name: Ada, Range')
    expect(queryScalarsForLocalView(values)).toEqual({ name: 'Ada' })
  })
})

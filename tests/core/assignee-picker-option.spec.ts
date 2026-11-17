import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

function read(path: string): string {
  return readFileSync(path, 'utf8')
}

describe('AssigneePicker option type', () => {
  it('uses one option type name and one id/name/department definition', () => {
    const sources = [
      'packages/core/src/types/assignee-picker.ts',
      'packages/core/src/utils/w9-data.ts',
      'packages/vue/src/components/AssigneePicker.ts',
      'packages/react/src/components/AssigneePicker.tsx',
      'examples/example/vue3/src/examples/assignee-picker/01/App.vue',
      'examples/example/react/src/examples/assignee-picker/01/App.tsx'
    ]
      .map(read)
      .join('\n')
    const definitions =
      sources.match(
        /export interface \w+ \{[^}]*\bid: string\b[^}]*\bname: string\b[^}]*\bdepartment\?: string/g
      ) ?? []
    expect(definitions).toHaveLength(1)
    expect(definitions[0]).toContain('AssigneePickerOption')
    expect(sources).not.toMatch(/\bAssigneeOption\b/)
  })
})

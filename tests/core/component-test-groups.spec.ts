import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  GROUP_FILTER_ALIASES,
  TEST_GROUPS,
  assertComponentTestGroupFiles,
  getComponentTestGroupFiles
} from '../../scripts/lib/component-test-groups.mjs'

const expectedGroups = [
  'basic',
  'form',
  'feedback',
  'layout',
  'navigation',
  'data',
  'charts',
  'advanced',
  'composite',
  'core'
]

const rootDir = process.cwd()

function getFiles(options: Parameters<typeof getComponentTestGroupFiles>[0]) {
  return getComponentTestGroupFiles({ rootDir, ...options })
}

function getPackageScripts() {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
    scripts: Record<string, string>
  }
  return packageJson.scripts
}

describe('component-test-groups', () => {
  it('should expose the expected group order', () => {
    expect(TEST_GROUPS).toEqual(expectedGroups)
  })

  it('should resolve every group to at least one test file', () => {
    for (const group of TEST_GROUPS) {
      expect(getFiles({ group }), group).not.toHaveLength(0)
    }
  })

  it('should return sorted unique relative paths', () => {
    const files = getFiles({ group: 'form' })
    const sorted = [...files].sort((a, b) => a.localeCompare(b))

    expect(files).toEqual(sorted)
    expect(new Set(files).size).toBe(files.length)
    expect(files.every((filePath) => filePath.startsWith('tests/'))).toBe(true)
    expect(files.every((filePath) => !filePath.startsWith('/'))).toBe(true)
  })

  it('should resolve the core group to core specs only', () => {
    const files = getFiles({ group: 'core' })

    expect(files.every((filePath) => filePath.startsWith('tests/core/'))).toBe(true)
    expect(files.every((filePath) => /\.spec\.tsx?$/.test(filePath))).toBe(true)
  })

  it('should include shared core files when framework is narrowed', () => {
    const files = getFiles({ group: 'form', framework: 'react', filter: 'primitives' })

    expect(files.some((filePath) => filePath.startsWith('tests/core/'))).toBe(true)
  })

  it('should include only React component specs when framework is react', () => {
    const files = getFiles({ group: 'form', framework: 'react', filter: 'primitives' })
    const componentFiles = files.filter((filePath) => !filePath.startsWith('tests/core/'))

    expect(componentFiles.every((filePath) => filePath.startsWith('tests/react/'))).toBe(true)
    expect(componentFiles.every((filePath) => filePath.endsWith('.spec.tsx'))).toBe(true)
    expect(componentFiles.some((filePath) => filePath.includes('/Input.spec.tsx'))).toBe(true)
  })

  it('should include only Vue component specs when framework is vue', () => {
    const files = getFiles({ group: 'form', framework: 'vue', filter: 'composite' })
    const componentFiles = files.filter((filePath) => !filePath.startsWith('tests/core/'))

    expect(componentFiles.every((filePath) => filePath.startsWith('tests/vue/'))).toBe(true)
    expect(componentFiles.every((filePath) => filePath.endsWith('.spec.ts'))).toBe(true)
    expect(componentFiles.some((filePath) => filePath.includes('/Select.spec.ts'))).toBe(true)
  })

  it('should keep primitive and composite form aliases separate', () => {
    const primitives = getFiles({ group: 'form', filter: 'primitives' })
    const composite = getFiles({ group: 'form', filter: 'composite' })

    expect(primitives.some((filePath) => filePath.includes('/Input.spec.tsx'))).toBe(true)
    expect(primitives.some((filePath) => filePath.includes('/Select.spec.tsx'))).toBe(false)
    expect(composite.some((filePath) => filePath.includes('/Select.spec.tsx'))).toBe(true)
    expect(composite.some((filePath) => filePath.includes('/InputNumber.spec.tsx'))).toBe(false)
  })

  it('should document the current form filter aliases', () => {
    expect(GROUP_FILTER_ALIASES.form.primitives).toContain('input-number')
    expect(GROUP_FILTER_ALIASES.form.composite).toContain('tree-select')
  })

  it('should fail clearly for unknown groups', () => {
    expect(() => getFiles({ group: 'unknown' })).toThrow(
      /Unknown test group "unknown".*basic, form, feedback/
    )
  })

  it('should fail clearly for unknown frameworks', () => {
    expect(() => getFiles({ group: 'form', framework: 'svelte' })).toThrow(
      'Unknown framework "svelte". Expected react, vue, or all.'
    )
  })

  it('should return an empty list for unmatched filters', () => {
    expect(getFiles({ group: 'form', filter: 'definitely-no-match' })).toEqual([])
  })

  it('should fail clearly when an unmatched filter is asserted', () => {
    expect(() =>
      assertComponentTestGroupFiles({
        rootDir,
        group: 'form',
        filter: 'definitely-no-match'
      })
    ).toThrow('No test files found for group "form" with filter "definitely-no-match".')
  })

  it('should expose a root package script for each group', () => {
    const scripts = getPackageScripts()

    expect(scripts['test:group']).toBe('node ./scripts/run-component-group-tests.mjs')
    for (const group of TEST_GROUPS) {
      expect(scripts[`test:group:${group}`]).toBe(
        `node ./scripts/run-component-group-tests.mjs --group ${group}`
      )
    }
  })

  it('should keep test:validate available for grouped quality scans', () => {
    expect(getPackageScripts()['test:validate']).toBe('node ./scripts/validate-tests.mjs')
  })
})

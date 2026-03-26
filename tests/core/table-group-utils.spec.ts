/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import {
  groupDataByColumn,
  tableGroupHeaderClasses,
  getGroupHeaderCellClasses
} from '@expcat/tigercat-core'

const data = [
  { id: 1, name: 'Alice', dept: 'Engineering' },
  { id: 2, name: 'Bob', dept: 'Design' },
  { id: 3, name: 'Charlie', dept: 'Engineering' },
  { id: 4, name: 'Diana', dept: 'Design' },
  { id: 5, name: 'Eve', dept: 'Marketing' }
]

describe('groupDataByColumn', () => {
  it('should group data by column key', () => {
    const groups = groupDataByColumn(data, 'dept')
    expect(groups.size).toBe(3)
    expect(groups.get('Engineering')).toHaveLength(2)
    expect(groups.get('Design')).toHaveLength(2)
    expect(groups.get('Marketing')).toHaveLength(1)
  })

  it('should preserve order within groups', () => {
    const groups = groupDataByColumn(data, 'dept')
    const engineering = groups.get('Engineering')!
    expect(engineering[0].name).toBe('Alice')
    expect(engineering[1].name).toBe('Charlie')
  })

  it('should handle missing column values as empty string', () => {
    const dataWithMissing = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob', dept: 'X' }
    ]
    const groups = groupDataByColumn(dataWithMissing, 'dept')
    expect(groups.has('')).toBe(true)
    expect(groups.get('')).toHaveLength(1)
  })

  it('should return empty map for empty data', () => {
    const groups = groupDataByColumn([], 'dept')
    expect(groups.size).toBe(0)
  })
})

describe('tableGroupHeaderClasses', () => {
  it('should be a non-empty string', () => {
    expect(tableGroupHeaderClasses).toBeTruthy()
    expect(typeof tableGroupHeaderClasses).toBe('string')
  })
})

describe('getGroupHeaderCellClasses', () => {
  it('should return padding classes for each size', () => {
    expect(getGroupHeaderCellClasses('sm')).toContain('px-3')
    expect(getGroupHeaderCellClasses('md')).toContain('px-4')
    expect(getGroupHeaderCellClasses('lg')).toContain('px-6')
  })
})

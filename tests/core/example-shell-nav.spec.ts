/**
 * @vitest-environment node
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { demoCopy, toZhHant } from '../../examples/example/shared/zh-hant'
import {
  navGroupFromCollapseChange,
  navGroupKeyForPath,
  navOpenKeys
} from '../../examples/example/shared/nav-accordion'

describe('example shell nav accordion', () => {
  it('opens only the group that contains the active route', () => {
    expect(navGroupKeyForPath('/button')).toBe('basic')
    expect(navGroupKeyForPath('/calendar')).not.toBe('basic')
    expect(navGroupKeyForPath('/calendar')).toBeTruthy()
    expect(navGroupKeyForPath('/')).toBeNull()
  })

  it('keeps a single open group and expands every match while searching', () => {
    expect(
      navOpenKeys({
        query: '',
        visibleGroupKeys: ['basic', 'layout', 'nav'],
        openGroupKey: 'layout'
      })
    ).toEqual(['layout'])
    expect(
      navOpenKeys({
        query: '',
        visibleGroupKeys: ['basic'],
        openGroupKey: 'layout'
      })
    ).toEqual([])
    expect(
      navOpenKeys({
        query: 'tab',
        visibleGroupKeys: ['nav', 'data'],
        openGroupKey: 'basic'
      })
    ).toEqual(['nav', 'data'])
  })

  it('wires both shells to one open group and drops the old collapsed map', () => {
    const root = fileURLToPath(new URL('../..', import.meta.url))
    const files = [
      'examples/example/vue3/src/components/AppSider.vue',
      'examples/example/react/src/components/AppSider.tsx'
    ]
    for (const file of files) {
      const source = readFileSync(join(root, file), 'utf8')
      expect(source).toContain('accordion')
      expect(source).toContain('navOpenKeys')
      expect(source).not.toContain('getStoredCollapsedNavGroups')
    }
  })

  it('treats collapse changes as one accordion key', () => {
    expect(navGroupFromCollapseChange(undefined)).toBeNull()
    expect(navGroupFromCollapseChange([])).toBeNull()
    expect(navGroupFromCollapseChange('layout')).toBe('layout')
    expect(navGroupFromCollapseChange(['basic', 'layout'])).toBe('layout')
  })
})

describe('example shell traditional copy', () => {
  it('derives Traditional nav labels from Simplified copy', () => {
    expect(toZhHant('基础组件')).toBe('基礎組件')
    expect(toZhHant('Checkbox 复选框')).toBe('Checkbox 複選框')
    expect(toZhHant('Tag 标签')).toBe('Tag 標籤')
    expect(toZhHant('Tabs 标签页')).toBe('Tabs 標籤頁')
    expect(toZhHant('Collapse 折叠面板')).toBe('Collapse 摺疊面板')
    expect(toZhHant('Calendar 日历')).toBe('Calendar 日曆')
    expect(toZhHant('Breadcrumb 面包屑')).toBe('Breadcrumb 麵包屑')
    expect(toZhHant('Layout 布局')).toBe('Layout 佈局')
    expect(toZhHant('Signature 手写签名')).toBe('Signature 手寫簽名')
    expect(demoCopy({ 'zh-CN': 'Button 按钮', 'en-US': 'Button' }, 'zh-TW')).toBe('Button 按鈕')
    expect(demoCopy({ 'zh-CN': 'Button 按钮', 'en-US': 'Button' }, 'en-US')).toBe('Button')
  })
})

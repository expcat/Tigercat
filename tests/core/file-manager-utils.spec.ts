import { describe, it, expect } from 'vitest'
import {
  sortFileItems,
  filterFileItems,
  filterHiddenFiles,
  formatFileSizeLabel,
  getFileExtension,
  navigateToFolder,
  getFileManagerContainerClasses,
  getFileItemClasses,
  fileManagerContainerClasses,
  fileManagerListItemClasses,
  fileManagerListItemSelectedClasses,
  fileManagerGridItemClasses,
  fileManagerGridItemSelectedClasses,
  type FileItem
} from '@expcat/tigercat-core'

const makeFile = (name: string, overrides?: Partial<FileItem>): FileItem => ({
  key: name,
  name,
  type: 'file',
  ...overrides
})

const makeFolder = (
  name: string,
  children: FileItem[] = [],
  overrides?: Partial<FileItem>
): FileItem => ({
  key: name,
  name,
  type: 'folder',
  children,
  ...overrides
})

describe('file-manager-utils', () => {
  // ─── sortFileItems ────────────────────────────────────────

  describe('sortFileItems', () => {
    it('folders before files', () => {
      const items = [makeFile('b.txt'), makeFolder('a')]
      const sorted = sortFileItems(items, 'name', 'asc')
      expect(sorted[0].name).toBe('a')
      expect(sorted[1].name).toBe('b.txt')
    })

    it('sorts by name ascending', () => {
      const items = [makeFile('c.txt'), makeFile('a.txt'), makeFile('b.txt')]
      const sorted = sortFileItems(items, 'name', 'asc')
      expect(sorted.map((i) => i.name)).toEqual(['a.txt', 'b.txt', 'c.txt'])
    })

    it('sorts by name descending', () => {
      const items = [makeFile('a.txt'), makeFile('c.txt'), makeFile('b.txt')]
      const sorted = sortFileItems(items, 'name', 'desc')
      expect(sorted.map((i) => i.name)).toEqual(['c.txt', 'b.txt', 'a.txt'])
    })

    it('sorts by size', () => {
      const items = [
        makeFile('big', { size: 1000 }),
        makeFile('small', { size: 10 }),
        makeFile('mid', { size: 500 })
      ]
      const sorted = sortFileItems(items, 'size', 'asc')
      expect(sorted.map((i) => i.name)).toEqual(['small', 'mid', 'big'])
    })

    it('sorts by modified', () => {
      const items = [
        makeFile('old', { modified: '2020-01-01' }),
        makeFile('new', { modified: '2024-01-01' })
      ]
      const sorted = sortFileItems(items, 'modified', 'asc')
      expect(sorted[0].name).toBe('old')
    })
  })

  // ─── filterFileItems ──────────────────────────────────────

  describe('filterFileItems', () => {
    it('filters by name case-insensitive', () => {
      const items = [makeFile('README.md'), makeFile('index.ts'), makeFile('test.ts')]
      const filtered = filterFileItems(items, 'readme')
      expect(filtered.length).toBe(1)
      expect(filtered[0].name).toBe('README.md')
    })

    it('returns all items for empty search', () => {
      const items = [makeFile('a'), makeFile('b')]
      expect(filterFileItems(items, '').length).toBe(2)
      expect(filterFileItems(items, '  ').length).toBe(2)
    })
  })

  // ─── filterHiddenFiles ────────────────────────────────────

  describe('filterHiddenFiles', () => {
    it('hides files starting with dot', () => {
      const items = [makeFile('.gitignore'), makeFile('README.md')]
      const filtered = filterHiddenFiles(items, false)
      expect(filtered.length).toBe(1)
      expect(filtered[0].name).toBe('README.md')
    })

    it('shows hidden files when flag is true', () => {
      const items = [makeFile('.env'), makeFile('app.ts')]
      expect(filterHiddenFiles(items, true).length).toBe(2)
    })
  })

  // ─── formatFileSizeLabel ───────────────────────────────────

  describe('formatFileSizeLabel', () => {
    it('returns empty for undefined', () => {
      expect(formatFileSizeLabel(undefined)).toBe('')
    })

    it('formats 0 bytes', () => {
      expect(formatFileSizeLabel(0)).toBe('0 B')
    })

    it('formats bytes', () => {
      expect(formatFileSizeLabel(512)).toBe('512 B')
    })

    it('formats kilobytes', () => {
      expect(formatFileSizeLabel(1024)).toBe('1 KB')
    })

    it('formats megabytes', () => {
      expect(formatFileSizeLabel(1024 * 1024 * 2.5)).toBe('2.5 MB')
    })
  })

  // ─── getFileExtension ─────────────────────────────────────

  describe('getFileExtension', () => {
    it('returns extension', () => {
      expect(getFileExtension('file.ts')).toBe('ts')
    })

    it('returns empty for no extension', () => {
      expect(getFileExtension('Makefile')).toBe('')
    })

    it('returns last extension', () => {
      expect(getFileExtension('archive.tar.gz')).toBe('gz')
    })

    it('lowercases extension', () => {
      expect(getFileExtension('Image.PNG')).toBe('png')
    })

    it('returns empty for dotfile', () => {
      expect(getFileExtension('.gitignore')).toBe('')
    })
  })

  // ─── navigateToFolder ─────────────────────────────────────

  describe('navigateToFolder', () => {
    const tree: FileItem[] = [
      makeFolder('src', [makeFile('index.ts'), makeFolder('utils', [makeFile('helpers.ts')])]),
      makeFile('README.md')
    ]

    it('returns root items for empty path', () => {
      const items = navigateToFolder(tree, [])
      expect(items.length).toBe(2)
    })

    it('navigates into folder', () => {
      const items = navigateToFolder(tree, ['src'])
      expect(items.length).toBe(2)
      expect(items[0].name).toBe('index.ts')
    })

    it('navigates nested', () => {
      const items = navigateToFolder(tree, ['src', 'utils'])
      expect(items.length).toBe(1)
      expect(items[0].name).toBe('helpers.ts')
    })

    it('returns empty for invalid path', () => {
      expect(navigateToFolder(tree, ['nonexistent']).length).toBe(0)
    })
  })

  // ─── Class generators ────────────────────────────────────

  describe('getFileManagerContainerClasses', () => {
    it('returns base classes', () => {
      expect(getFileManagerContainerClasses()).toBe(fileManagerContainerClasses)
    })

    it('appends className', () => {
      const cls = getFileManagerContainerClasses('custom')
      expect(cls).toContain('custom')
    })
  })

  describe('getFileItemClasses', () => {
    it('list mode - not selected', () => {
      const cls = getFileItemClasses('list', false)
      expect(cls).toBe(fileManagerListItemClasses)
    })

    it('list mode - selected', () => {
      const cls = getFileItemClasses('list', true)
      expect(cls).toContain(fileManagerListItemSelectedClasses)
    })

    it('grid mode - not selected', () => {
      const cls = getFileItemClasses('grid', false)
      expect(cls).toBe(fileManagerGridItemClasses)
    })

    it('grid mode - selected', () => {
      const cls = getFileItemClasses('grid', true)
      expect(cls).toContain(fileManagerGridItemSelectedClasses)
    })
  })
})

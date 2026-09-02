import { describe, it, expect } from 'vitest'
import {
  sortFileItems,
  filterFileItems,
  filterHiddenFiles,
  formatBytes,
  formatFileSizeLabel,
  getFileExtension,
  getFileExtensionName,
  navigateToFolder,
  deriveFileManagerModel,
  toggleFileSelection,
  resolveFileOpen,
  sliceBreadcrumbPath,
  buildFileBreadcrumb,
  reorderFileTreeAtPath,
  applyFileManagerReorder,
  clampFileManagerFocusIndex,
  resolveFileManagerItemKeydown,
  toFileDragItem,
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

    it('shares core byte formatting while preserving FileManager precision', () => {
      expect(formatBytes(1024, { precision: 2 })).toBe('1.00 KB')
      expect(formatBytes(1024, { precision: 2, trimTrailingZeros: true })).toBe('1 KB')
      expect(formatFileSizeLabel(Number.NaN)).toBe('')
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

    it('shares core extension parsing with optional dotted aliases', () => {
      expect(getFileExtensionName('Archive.TAR.GZ')).toBe('gz')
      expect(getFileExtensionName('Archive.TAR.GZ', { includeDot: true })).toBe('.gz')
      expect(getFileExtensionName('folder.')).toBe('')
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

    it('looks up folders by key, not display name', () => {
      const dupes: FileItem[] = [
        makeFolder('src', [makeFile('first.ts')], { key: 'src-a' }),
        makeFolder('src', [makeFile('second.ts')], { key: 'src-b' })
      ]
      expect(navigateToFolder(dupes, ['src-b']).map((item) => item.name)).toEqual(['second.ts'])
    })
  })

  // ─── deriveFileManagerModel ───────────────────────────────

  describe('deriveFileManagerModel', () => {
    const tree: FileItem[] = [
      makeFolder('src', [makeFile('index.ts'), makeFile('utils.ts')]),
      makeFile('README.md', { size: 2048 }),
      makeFile('.env', { size: 64 })
    ]

    it('returns root items when path is empty', () => {
      const m = deriveFileManagerModel({
        files: tree,
        currentPath: [],
        selectedKeys: [],
        sortField: 'name',
        sortOrder: 'asc',
        showHidden: true,
        searchText: ''
      })
      // folders first, then files sorted: .env, README.md
      expect(m.processedItems.length).toBe(3)
      expect(m.processedItems[0].name).toBe('src')
    })

    it('navigates into folder', () => {
      const m = deriveFileManagerModel({
        files: tree,
        currentPath: ['src'],
        selectedKeys: [],
        sortField: 'name',
        sortOrder: 'asc',
        showHidden: false,
        searchText: ''
      })
      expect(m.processedItems.map((i) => i.name)).toEqual(['index.ts', 'utils.ts'])
    })

    it('filters hidden files', () => {
      const m = deriveFileManagerModel({
        files: tree,
        currentPath: [],
        selectedKeys: [],
        sortField: 'name',
        sortOrder: 'asc',
        showHidden: false,
        searchText: ''
      })
      expect(m.processedItems.find((i) => i.name === '.env')).toBeUndefined()
    })

    it('keeps source order while draggable so drop order is not resorted', () => {
      const items: FileItem[] = [makeFile('c.txt'), makeFile('a.txt'), makeFolder('z')]
      const m = deriveFileManagerModel({
        files: items,
        currentPath: [],
        selectedKeys: [],
        sortField: 'name',
        sortOrder: 'asc',
        showHidden: true,
        searchText: '',
        draggable: true
      })
      expect(m.processedItems.map((item) => item.name)).toEqual(['c.txt', 'a.txt', 'z'])
      expect(m.canReorder).toBe(true)
    })

    it('filters by search text', () => {
      const m = deriveFileManagerModel({
        files: tree,
        currentPath: [],
        selectedKeys: [],
        sortField: 'name',
        sortOrder: 'asc',
        showHidden: true,
        searchText: 'READ'
      })
      expect(m.processedItems.length).toBe(1)
      expect(m.processedItems[0].name).toBe('README.md')
    })

    it('builds selectedSet', () => {
      const m = deriveFileManagerModel({
        files: tree,
        currentPath: [],
        selectedKeys: ['src', 'readme'],
        sortField: 'name',
        sortOrder: 'asc',
        showHidden: false,
        searchText: ''
      })
      expect(m.selectedSet.has('src')).toBe(true)
      expect(m.selectedSet.has('readme')).toBe(true)
      expect(m.selectedSet.has('.env')).toBe(false)
    })
  })

  // ─── toggleFileSelection ──────────────────────────────────

  describe('toggleFileSelection', () => {
    it('adds key in single mode (clears others)', () => {
      const result = toggleFileSelection(['a'], 'b', false)
      expect(result).toEqual(['b'])
    })

    it('adds key in multi mode (keeps others)', () => {
      const result = toggleFileSelection(['a'], 'b', true)
      expect(result).toEqual(['a', 'b'])
    })

    it('removes key if already selected', () => {
      const result = toggleFileSelection(['a', 'b'], 'a', true)
      expect(result).toEqual(['b'])
    })
  })

  // ─── resolveFileOpen ──────────────────────────────────────

  describe('resolveFileOpen', () => {
    it('returns navigate for folder', () => {
      const result = resolveFileOpen(makeFolder('src', [], { key: 'src-id' }), ['root'])
      expect(result).toEqual({ type: 'navigate', path: ['root', 'src-id'] })
    })

    it('returns open for file', () => {
      const file = makeFile('index.ts')
      const result = resolveFileOpen(file, [])
      expect(result).toEqual({ type: 'open', item: file })
    })

    it('returns null for disabled item', () => {
      const result = resolveFileOpen(makeFile('x', { disabled: true }), [])
      expect(result).toBeNull()
    })
  })

  // ─── sliceBreadcrumbPath ──────────────────────────────────

  describe('sliceBreadcrumbPath', () => {
    it('returns empty for index 0', () => {
      expect(sliceBreadcrumbPath(['a', 'b', 'c'], 0)).toEqual([])
    })

    it('slices to index', () => {
      expect(sliceBreadcrumbPath(['a', 'b', 'c'], 2)).toEqual(['a', 'b'])
    })
  })

  // ─── toFileDragItem ───────────────────────────────────────

  describe('breadcrumb and reorder', () => {
    it('builds breadcrumb labels from names while paths stay keys', () => {
      const tree: FileItem[] = [
        makeFolder('Documents', [makeFolder('Work', [makeFile('a.txt')])], { key: 'docs' })
      ]
      const crumbs = buildFileBreadcrumb(tree, ['docs'], 'Root')
      expect(crumbs.map((item) => item.name)).toEqual(['Root', 'Documents'])
      expect(crumbs[1]?.path).toEqual(['docs'])
      expect(crumbs[1]?.current).toBe(true)
    })

    it('rewrites the current folder in the source tree', () => {
      const tree: FileItem[] = [
        makeFolder('src', [makeFile('a.ts'), makeFile('b.ts'), makeFile('c.ts')])
      ]
      const next = reorderFileTreeAtPath(tree, ['src'], 2, 0)
      expect(next[0]?.children?.map((item) => item.name)).toEqual(['c.ts', 'a.ts', 'b.ts'])
      expect(tree[0]?.children?.map((item) => item.name)).toEqual(['a.ts', 'b.ts', 'c.ts'])
    })

    it('refuses to drop onto a disabled item', () => {
      const layer = [makeFile('a.ts'), makeFile('locked.ts', { disabled: true }), makeFile('c.ts')]
      expect(applyFileManagerReorder(layer, [], 2, 1, layer)).toBeNull()
    })

    it('clamps roving focus onto the first enabled item', () => {
      const items = [makeFile('a'), makeFile('b')]
      expect(clampFileManagerFocusIndex(5, items)).toBe(0)
    })

    it('treats Backspace as navigate to the parent path', () => {
      const action = resolveFileManagerItemKeydown({
        key: 'Backspace',
        viewMode: 'list',
        gridColumns: 4,
        currentIndex: 0,
        items: [makeFile('a')],
        currentPath: ['src']
      })
      expect(action).toEqual({ type: 'up', path: [] })
    })
  })

  describe('toFileDragItem', () => {
    it('converts FileItem to DragItem', () => {
      const item = makeFile('index.ts')
      const drag = toFileDragItem(item, 3, 'container-1')
      expect(drag.id).toBe('index.ts')
      expect(drag.index).toBe(3)
      expect(drag.containerId).toBe('container-1')
      expect(drag.data).toEqual({ name: 'index.ts', type: 'file' })
    })
  })
})

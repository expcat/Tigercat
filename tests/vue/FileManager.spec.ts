import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { defineComponent, h, ref } from 'vue'
import { FileManager } from '@expcat/tigercat-vue/FileManager'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import type { FileItem } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils'

const files: FileItem[] = [
  {
    key: 'src',
    name: 'src',
    type: 'folder',
    children: [{ key: 'index', name: 'index.ts', type: 'file', size: 1024 }]
  },
  { key: 'readme', name: 'README.md', type: 'file', size: 2048, modified: '2024-01-01' },
  { key: 'env', name: '.env', type: 'file', size: 64 }
]

describe('FileManager (Vue)', () => {
  it('renders file list', () => {
    const { getByText } = render(FileManager, {
      props: { files, showHidden: true }
    })
    expect(getByText('src')).toBeTruthy()
    expect(getByText('README.md')).toBeTruthy()
  })

  it('hides hidden files by default', () => {
    const { queryByText } = render(FileManager, {
      props: { files }
    })
    expect(queryByText('.env')).toBeNull()
  })

  it('shows hidden files when showHidden', () => {
    const { getByText } = render(FileManager, {
      props: { files, showHidden: true }
    })
    expect(getByText('.env')).toBeTruthy()
  })

  it('shows breadcrumb with Root', () => {
    const { getByText } = render(FileManager, {
      props: { files }
    })
    expect(getByText('Root')).toBeTruthy()
  })

  it('shows breadcrumb path segments', () => {
    const { getByText } = render(FileManager, {
      props: { files, currentPath: ['src'] }
    })
    expect(getByText('Root')).toBeTruthy()
    expect(getByText('src')).toBeTruthy()
  })

  it('navigates into folder on breadcrumb click', async () => {
    const wrapper = render(FileManager, {
      props: { files, currentPath: ['src'] }
    })
    await fireEvent.click(wrapper.getByText('Root'))
    expect(wrapper.emitted('update:currentPath')?.[0]).toEqual([[]])
  })

  it('navigates into folder on double-click', async () => {
    const wrapper = render(FileManager, {
      props: { files, showHidden: true }
    })
    await fireEvent.dblClick(wrapper.getByText('src'))
    expect(wrapper.emitted('update:currentPath')?.[0]).toEqual([['src']])
  })

  it('emits select on click', async () => {
    const wrapper = render(FileManager, {
      props: { files }
    })
    await fireEvent.click(wrapper.getByText('README.md'))
    expect(wrapper.emitted('select')?.[0]).toBeTruthy()
  })

  it('selects README.md without selectedKeys (uncontrolled)', async () => {
    const wrapper = render(FileManager, {
      props: { files }
    })
    await fireEvent.click(wrapper.getByText('README.md'))
    expect(wrapper.getByText('README.md').closest('[role="option"]')).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(wrapper.emitted('update:selectedKeys')?.[0]?.[0]).toEqual(['readme'])
  })

  it('seeds selection from defaultSelectedKeys', () => {
    const { getByText } = render(FileManager, {
      props: { files, defaultSelectedKeys: ['readme'] }
    })
    expect(getByText('README.md').closest('[role="option"]')).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('keeps explicit selectedKeys=[] controlled empty after click', async () => {
    const wrapper = render(FileManager, {
      props: { files, selectedKeys: [] }
    })
    await fireEvent.click(wrapper.getByText('README.md'))
    expect(wrapper.emitted('update:selectedKeys')?.[0]?.[0]).toEqual(['readme'])
    expect(wrapper.getByText('README.md').closest('[role="option"]')).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  it('shows empty text when folder is empty', () => {
    const { getByText } = render(FileManager, {
      props: { files: [], emptyText: 'Nothing here' }
    })
    expect(getByText('Nothing here')).toBeTruthy()
  })

  it('shows loading overlay', () => {
    const { getByRole } = render(FileManager, {
      props: { files, loading: true }
    })
    expect(getByRole('status')).toBeTruthy()
    expect(getByRole('listbox')).toHaveAttribute('aria-disabled', 'true')
  })

  it('renders search input when searchable', () => {
    const { container } = render(FileManager, {
      props: { files, searchable: true }
    })
    expect(container.querySelector('input[type="text"]')).toBeTruthy()
  })

  it('filters files by search', async () => {
    const wrapper = render(FileManager, {
      props: { files, searchable: true, showHidden: true }
    })
    const input = wrapper.container.querySelector('input')!
    await fireEvent.update(input, 'README')
    expect(wrapper.queryByText('src')).toBeNull()
    expect(wrapper.getByText('README.md')).toBeTruthy()
  })

  it('names the breadcrumb from locale, not a hardcoded English string', () => {
    const { getByRole } = render({
      setup: () => () => h(ConfigProvider, { locale: zhCN }, () => h(FileManager, { files }))
    })
    expect(getByRole('navigation').getAttribute('aria-label')).toBe(zhCN.fileManager?.pathAriaLabel)
    expect(getByRole('navigation').getAttribute('aria-label')).not.toBe('File path')
  })

  it('has listbox role on content area', () => {
    const { getByRole } = render(FileManager, {
      props: { files }
    })
    expect(getByRole('listbox')).toBeTruthy()
  })

  it('applies custom className', () => {
    const { container } = render(FileManager, {
      props: { files, className: 'my-fm' }
    })
    expect(container.firstElementChild?.className).toContain('my-fm')
  })

  it('shows current path files', () => {
    const { getByText, queryByText } = render(FileManager, {
      props: { files, currentPath: ['src'] }
    })
    expect(getByText('index.ts')).toBeTruthy()
    expect(queryByText('README.md')).toBeNull()
  })

  // --- Edge cases ---
  it('shows default empty text for empty folder', () => {
    const { getByText } = render(FileManager, {
      props: { files: [] }
    })
    expect(getByText('Empty folder')).toBeTruthy()
  })

  it('navigates to invalid path gracefully (empty result)', () => {
    const { getByText } = render(FileManager, {
      props: { files, currentPath: ['nonexistent'], emptyText: 'Nothing' }
    })
    expect(getByText('Nothing')).toBeTruthy()
  })

  it('does not emit select for disabled item', async () => {
    const disabledFiles: FileItem[] = [
      { key: 'locked', name: 'locked.txt', type: 'file', disabled: true }
    ]
    const wrapper = render(FileManager, {
      props: { files: disabledFiles }
    })
    await fireEvent.click(wrapper.getByText('locked.txt'))
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  it('supports multi-select', async () => {
    const wrapper = render(FileManager, {
      props: { files, multiple: true, showHidden: true }
    })
    await fireEvent.click(wrapper.getByText('README.md'))
    const firstEmit = wrapper.emitted('update:selectedKeys')?.[0]?.[0] as string[]
    expect(firstEmit).toContain('readme')
  })

  it('supports roving keyboard selection and folder open', async () => {
    const wrapper = render(FileManager, {
      props: { files, showHidden: true, multiple: true }
    })

    let options = wrapper.getAllByRole('option')
    expect(options[0]).toHaveAttribute('tabindex', '0')
    expect(options[1]).toHaveAttribute('tabindex', '-1')

    await fireEvent.keyDown(options[0], { key: 'ArrowDown' })
    options = wrapper.getAllByRole('option')
    expect(options[0]).toHaveAttribute('tabindex', '-1')
    expect(options[1]).toHaveAttribute('tabindex', '0')

    await fireEvent.keyDown(options[1], { key: ' ' })
    expect(wrapper.emitted('update:selectedKeys')?.[0]?.[0]).toEqual(['env'])

    const folderOption = wrapper.getByText('src').closest('[role="option"]') as HTMLElement
    await fireEvent.keyDown(folderOption, { key: 'Enter' })
    expect(wrapper.emitted('select')?.[1]?.[0]).toEqual(files[0])
    expect(wrapper.emitted('update:currentPath')?.[0]).toEqual([['src']])
  })

  it('deep nested path navigation', () => {
    const deepFiles: FileItem[] = [
      {
        key: 'a',
        name: 'a',
        type: 'folder',
        children: [
          {
            key: 'b',
            name: 'b',
            type: 'folder',
            children: [{ key: 'c', name: 'c.txt', type: 'file' }]
          }
        ]
      }
    ]
    const { getByText } = render(FileManager, {
      props: { files: deepFiles, currentPath: ['a', 'b'] }
    })
    expect(getByText('c.txt')).toBeTruthy()
  })

  it('enters a folder without a parent path handler', async () => {
    const { getByText, queryByText } = render(FileManager, { props: { files } })
    await fireEvent.dblClick(getByText('src'))
    expect(getByText('index.ts')).toBeTruthy()
    expect(queryByText('README.md')).toBeNull()
  })

  it('clears an uncontrolled search back to the full folder', async () => {
    const { getByText, queryByText, getByRole } = render(FileManager, {
      props: { files, searchable: true, showHidden: true }
    })
    const input = getByRole('textbox')
    await fireEvent.update(input, 'README')
    expect(queryByText('src')).toBeNull()
    await fireEvent.update(input, '')
    expect(getByText('src')).toBeTruthy()
  })

  it('lets a controlled empty search query win over the previous filter', async () => {
    const Harness = defineComponent({
      setup() {
        const text = ref('README')
        return () =>
          h(FileManager, {
            files,
            searchable: true,
            showHidden: true,
            searchText: text.value,
            'onUpdate:searchText': (value: string) => {
              text.value = value
            }
          })
      }
    })
    const { getByText, queryByText, getByRole } = render(Harness)
    expect(queryByText('src')).toBeNull()
    await fireEvent.update(getByRole('textbox'), '')
    expect(getByText('src')).toBeTruthy()
  })

  it('opens the second same-name folder by key', async () => {
    const dupes: FileItem[] = [
      {
        key: 'src-a',
        name: 'src',
        type: 'folder',
        children: [{ key: 'first', name: 'first.ts', type: 'file' }]
      },
      {
        key: 'src-b',
        name: 'src',
        type: 'folder',
        children: [{ key: 'second', name: 'second.ts', type: 'file' }]
      }
    ]
    const { getAllByText, getByText } = render(FileManager, { props: { files: dupes } })
    await fireEvent.dblClick(getAllByText('src')[1]!)
    expect(getByText('second.ts')).toBeTruthy()
  })

  it('resets roving tabindex after entering a one-item folder', async () => {
    const { getAllByRole, getByText } = render(FileManager, {
      props: { files, showHidden: true }
    })
    const options = getAllByRole('option')
    await fireEvent.keyDown(options[options.length - 1]!, { key: 'End' })
    const folder = getByText('src').closest('[role="option"]') as HTMLElement
    await fireEvent.keyDown(folder, { key: 'Enter' })
    const next = getAllByRole('option')
    expect(next).toHaveLength(1)
    expect(next[0]).toHaveAttribute('tabindex', '0')
    expect(next[0]).toHaveTextContent('index.ts')
  })

  it('forwards style onto the root', () => {
    const { container } = render(FileManager, {
      props: { files },
      attrs: { style: { height: '200px' } }
    })
    expect(container.firstElementChild).toHaveStyle({ height: '200px' })
  })

  it('reorders the current folder on drop and keeps sibling folders', async () => {
    const tree: FileItem[] = [
      {
        key: 'src',
        name: 'src',
        type: 'folder',
        children: [
          { key: 'a', name: 'a.ts', type: 'file' },
          { key: 'b', name: 'b.ts', type: 'file' },
          { key: 'c', name: 'c.ts', type: 'file' }
        ]
      },
      { key: 'readme', name: 'README.md', type: 'file' }
    ]
    const wrapper = render(FileManager, {
      props: { files: tree, currentPath: ['src'], draggable: true }
    })
    const dataTransfer = { setData: vi.fn(), effectAllowed: 'none', dropEffect: 'none' }
    await fireEvent.dragStart(wrapper.getByText('c.ts').closest('[role="option"]')!, {
      dataTransfer
    })
    await fireEvent.dragOver(wrapper.getByText('a.ts').closest('[role="option"]')!, {
      dataTransfer
    })
    await fireEvent.drop(wrapper.getByText('a.ts').closest('[role="option"]')!, { dataTransfer })
    const next = wrapper.emitted('update:files')?.[0]?.[0] as FileItem[]
    expect(next[0]?.children?.map((item) => item.name)).toEqual(['c.ts', 'a.ts', 'b.ts'])
    expect(next[1]?.name).toBe('README.md')
  })

  it('lays out grid items with a public column count', () => {
    const { getByRole } = render(FileManager, {
      props: { files, viewMode: 'grid', gridColumns: 2 }
    })
    expect(getByRole('listbox')).toHaveStyle({ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' })
  })

  it('breadcrumb shows all segments for deep path', () => {
    const deepFiles: FileItem[] = [
      {
        key: 'a',
        name: 'a',
        type: 'folder',
        children: [
          {
            key: 'b',
            name: 'b',
            type: 'folder',
            children: [{ key: 'c', name: 'c.txt', type: 'file' }]
          }
        ]
      }
    ]
    const { getByText } = render(FileManager, {
      props: { files: deepFiles, currentPath: ['a', 'b'] }
    })
    expect(getByText('Root')).toBeTruthy()
    expect(getByText('a')).toBeTruthy()
    expect(getByText('b')).toBeTruthy()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(FileManager)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React, { useState } from 'react'
import { FileManager } from '@expcat/tigercat-react/FileManager'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import type { FileItem } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const files: FileItem[] = [
  {
    key: 'src',
    name: 'src',
    type: 'folder',
    children: [{ key: 'index', name: 'index.ts', type: 'file', size: 1024 }]
  },
  {
    key: 'readme',
    name: 'README.md',
    type: 'file',
    size: 2048,
    modified: '2024-01-01'
  },
  { key: 'env', name: '.env', type: 'file', size: 64 }
]

describe('FileManager (React)', () => {
  it('renders file list', () => {
    const { getByText } = render(<FileManager files={files} showHidden />)
    expect(getByText('src')).toBeTruthy()
    expect(getByText('README.md')).toBeTruthy()
  })

  it('hides hidden files by default', () => {
    const { queryByText } = render(<FileManager files={files} />)
    expect(queryByText('.env')).toBeNull()
  })

  it('shows hidden files when showHidden', () => {
    const { getByText } = render(<FileManager files={files} showHidden />)
    expect(getByText('.env')).toBeTruthy()
  })

  it('shows breadcrumb', () => {
    const { getByText } = render(<FileManager files={files} />)
    expect(getByText('Root')).toBeTruthy()
  })

  it('shows path segments in breadcrumb', () => {
    const { getByText } = render(<FileManager files={files} currentPath={['src']} />)
    expect(getByText('Root')).toBeTruthy()
    expect(getByText('src')).toBeTruthy()
  })

  it('calls onCurrentPathChange on breadcrumb click', () => {
    const onCurrentPathChange = vi.fn()
    const { getByText } = render(
      <FileManager files={files} currentPath={['src']} onCurrentPathChange={onCurrentPathChange} />
    )
    fireEvent.click(getByText('Root'))
    expect(onCurrentPathChange).toHaveBeenCalledWith([])
  })

  it('calls onCurrentPathChange on folder double-click', () => {
    const onCurrentPathChange = vi.fn()
    const { getByText } = render(
      <FileManager files={files} showHidden onCurrentPathChange={onCurrentPathChange} />
    )
    fireEvent.doubleClick(getByText('src'))
    expect(onCurrentPathChange).toHaveBeenCalledWith(['src'])
  })

  it('calls onSelect on click', () => {
    const onSelect = vi.fn()
    const { getByText } = render(<FileManager files={files} onSelect={onSelect} />)
    fireEvent.click(getByText('README.md'))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('selects README.md without selectedKeys (uncontrolled)', () => {
    const { getByText } = render(<FileManager files={files} />)
    fireEvent.click(getByText('README.md'))
    expect(getByText('README.md').closest('[role="option"]')).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('seeds selection from defaultSelectedKeys', () => {
    const { getByText } = render(<FileManager files={files} defaultSelectedKeys={['readme']} />)
    expect(getByText('README.md').closest('[role="option"]')).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })

  it('keeps explicit selectedKeys=[] controlled empty after click', () => {
    const onSelectedKeysChange = vi.fn()
    const { getByText } = render(
      <FileManager files={files} selectedKeys={[]} onSelectedKeysChange={onSelectedKeysChange} />
    )
    fireEvent.click(getByText('README.md'))
    expect(onSelectedKeysChange).toHaveBeenCalledWith(['readme'])
    expect(getByText('README.md').closest('[role="option"]')).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  it('calls onOpen on file double-click', () => {
    const onOpen = vi.fn()
    const { getByText } = render(<FileManager files={files} onOpen={onOpen} />)
    fireEvent.doubleClick(getByText('README.md'))
    expect(onOpen).toHaveBeenCalledOnce()
  })

  it('shows empty text when no files', () => {
    const { getByText } = render(<FileManager files={[]} emptyText="Nothing here" />)
    expect(getByText('Nothing here')).toBeTruthy()
  })

  it('shows loading overlay', () => {
    const { getByRole } = render(<FileManager files={files} loading />)
    expect(getByRole('status')).toBeTruthy()
    expect(getByRole('listbox')).toHaveAttribute('aria-disabled', 'true')
  })

  it('renders search input when searchable', () => {
    const { container } = render(<FileManager files={files} searchable />)
    expect(container.querySelector('input[type="text"]')).toBeTruthy()
  })

  it('filters files by search', () => {
    const { getByText, queryByText, container } = render(
      <FileManager files={files} searchable showHidden />
    )
    const input = container.querySelector('input')!
    fireEvent.change(input, { target: { value: 'README' } })
    expect(getByText('README.md')).toBeTruthy()
    // src folder should be filtered out by name
    expect(queryByText('src')).toBeNull()
  })

  it('names the breadcrumb from locale, not a hardcoded English string', () => {
    const { getByRole } = render(
      <ConfigProvider locale={zhCN}>
        <FileManager files={files} />
      </ConfigProvider>
    )
    expect(getByRole('navigation').getAttribute('aria-label')).toBe(zhCN.fileManager?.pathAriaLabel)
    expect(getByRole('navigation').getAttribute('aria-label')).not.toBe('File path')
  })

  it('has listbox role', () => {
    const { getByRole } = render(<FileManager files={files} />)
    expect(getByRole('listbox')).toBeTruthy()
  })

  it('applies custom className', () => {
    const { container } = render(<FileManager files={files} className="my-fm" />)
    expect(container.firstElementChild?.className).toContain('my-fm')
  })

  it('renders current path files', () => {
    const { getByText, queryByText } = render(<FileManager files={files} currentPath={['src']} />)
    expect(getByText('index.ts')).toBeTruthy()
    expect(queryByText('README.md')).toBeNull()
  })

  it('renders custom icon via renderIcon', () => {
    const { getByText } = render(
      <FileManager
        files={files}
        renderIcon={(item) => <span>{item.type === 'folder' ? 'DIR' : 'FILE'}</span>}
      />
    )
    expect(getByText('DIR')).toBeTruthy()
  })

  // --- Edge cases ---
  it('shows default empty text for empty folder', () => {
    const { getByText } = render(<FileManager files={[]} />)
    expect(getByText('Empty folder')).toBeTruthy()
  })

  it('navigates to invalid path gracefully (empty result)', () => {
    const { getByText } = render(
      <FileManager files={files} currentPath={['nonexistent']} emptyText="Nothing" />
    )
    expect(getByText('Nothing')).toBeTruthy()
  })

  it('does not call onSelect for disabled item', () => {
    const disabledFiles: FileItem[] = [
      { key: 'locked', name: 'locked.txt', type: 'file', disabled: true }
    ]
    const onSelect = vi.fn()
    const { getByText } = render(<FileManager files={disabledFiles} onSelect={onSelect} />)
    fireEvent.click(getByText('locked.txt'))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('supports multi-select', () => {
    const onSelectedKeysChange = vi.fn()
    const { getByText } = render(
      <FileManager files={files} multiple showHidden onSelectedKeysChange={onSelectedKeysChange} />
    )
    fireEvent.click(getByText('README.md'))
    expect(onSelectedKeysChange).toHaveBeenCalledOnce()
    const keys = onSelectedKeysChange.mock.calls[0][0] as string[]
    expect(keys).toContain('readme')
  })

  it('supports roving keyboard selection and folder open', () => {
    const onSelect = vi.fn()
    const onCurrentPathChange = vi.fn()
    const onSelectedKeysChange = vi.fn()
    const { getAllByRole, getByText } = render(
      <FileManager
        files={files}
        showHidden
        multiple
        onSelect={onSelect}
        onCurrentPathChange={onCurrentPathChange}
        onSelectedKeysChange={onSelectedKeysChange}
      />
    )

    let options = getAllByRole('option')
    expect(options[0]).toHaveAttribute('tabindex', '0')
    expect(options[1]).toHaveAttribute('tabindex', '-1')

    fireEvent.keyDown(options[0], { key: 'ArrowDown' })
    options = getAllByRole('option')
    expect(options[0]).toHaveAttribute('tabindex', '-1')
    expect(options[1]).toHaveAttribute('tabindex', '0')

    fireEvent.keyDown(options[1], { key: ' ' })
    expect(onSelectedKeysChange).toHaveBeenCalledWith(['env'])

    const folderOption = getByText('src').closest('[role="option"]') as HTMLElement
    fireEvent.keyDown(folderOption, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(files[0])
    expect(onCurrentPathChange).toHaveBeenCalledWith(['src'])
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
    const { getByText } = render(<FileManager files={deepFiles} currentPath={['a', 'b']} />)
    expect(getByText('c.txt')).toBeTruthy()
  })

  it('enters a folder without a parent path handler', () => {
    const { getByText, queryByText } = render(<FileManager files={files} />)
    fireEvent.doubleClick(getByText('src'))
    expect(getByText('index.ts')).toBeTruthy()
    expect(queryByText('README.md')).toBeNull()
  })

  it('clears an uncontrolled search back to the full folder', () => {
    const { getByText, queryByText, getByRole } = render(
      <FileManager files={files} searchable showHidden />
    )
    const input = getByRole('textbox')
    fireEvent.change(input, { target: { value: 'README' } })
    expect(queryByText('src')).toBeNull()
    fireEvent.change(input, { target: { value: '' } })
    expect(getByText('src')).toBeTruthy()
  })

  it('lets a controlled empty search query win over the previous filter', () => {
    function Harness() {
      const [text, setText] = useState('README')
      return (
        <FileManager
          files={files}
          searchable
          showHidden
          searchText={text}
          onSearchTextChange={setText}
        />
      )
    }
    const { getByText, queryByText, getByRole } = render(<Harness />)
    expect(queryByText('src')).toBeNull()
    fireEvent.change(getByRole('textbox'), { target: { value: '' } })
    expect(getByText('src')).toBeTruthy()
  })

  it('opens the second same-name folder by key', () => {
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
    const { getAllByText, getByText } = render(<FileManager files={dupes} />)
    fireEvent.doubleClick(getAllByText('src')[1]!)
    expect(getByText('second.ts')).toBeTruthy()
  })

  it('resets roving tabindex after entering a one-item folder', () => {
    const { getAllByRole, getByText } = render(<FileManager files={files} showHidden />)
    const options = getAllByRole('option')
    fireEvent.keyDown(options[options.length - 1]!, { key: 'End' })
    const folder = getByText('src').closest('[role="option"]') as HTMLElement
    fireEvent.keyDown(folder, { key: 'Enter' })
    const next = getAllByRole('option')
    expect(next).toHaveLength(1)
    expect(next[0]).toHaveAttribute('tabindex', '0')
    expect(next[0]).toHaveTextContent('index.ts')
  })

  it('forwards style onto the root', () => {
    const { container } = render(<FileManager files={files} style={{ height: 200 }} />)
    expect(container.firstElementChild).toHaveStyle({ height: '200px' })
  })

  it('reorders the current folder on drop and keeps sibling folders', () => {
    const onFilesChange = vi.fn()
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
    const { getByText } = render(
      <FileManager files={tree} currentPath={['src']} draggable onFilesChange={onFilesChange} />
    )
    const dataTransfer = { setData: vi.fn(), effectAllowed: 'none', dropEffect: 'none' }
    fireEvent.dragStart(getByText('c.ts').closest('[role="option"]')!, { dataTransfer })
    fireEvent.dragOver(getByText('a.ts').closest('[role="option"]')!, { dataTransfer })
    fireEvent.drop(getByText('a.ts').closest('[role="option"]')!, { dataTransfer })
    expect(onFilesChange).toHaveBeenCalledOnce()
    const next = onFilesChange.mock.calls[0][0] as FileItem[]
    expect(next[0]?.children?.map((item) => item.name)).toEqual(['c.ts', 'a.ts', 'b.ts'])
    expect(next[1]?.name).toBe('README.md')
  })

  it('lays out grid items with a public column count', () => {
    const { getByRole } = render(<FileManager files={files} viewMode="grid" gridColumns={2} />)
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
    const { getByText } = render(<FileManager files={deepFiles} currentPath={['a', 'b']} />)
    expect(getByText('Root')).toBeTruthy()
    expect(getByText('a')).toBeTruthy()
    expect(getByText('b')).toBeTruthy()
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<FileManager />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})

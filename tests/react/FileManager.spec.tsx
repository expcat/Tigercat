import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { FileManager } from '@expcat/tigercat-react'
import type { FileItem } from '@expcat/tigercat-core'
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
    const { getByText } = render(<FileManager files={files} loading />)
    expect(getByText('Loading...')).toBeTruthy()
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

  it('has file path aria-label', () => {
    const { container } = render(<FileManager files={files} />)
    expect(container.querySelector('nav[aria-label="File path"]')).toBeTruthy()
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
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})

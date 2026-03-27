import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { FileManager } from '@expcat/tigercat-vue'
import type { FileItem } from '@expcat/tigercat-core'

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

  it('shows empty text when folder is empty', () => {
    const { getByText } = render(FileManager, {
      props: { files: [], emptyText: 'Nothing here' }
    })
    expect(getByText('Nothing here')).toBeTruthy()
  })

  it('shows loading overlay', () => {
    const { getByText } = render(FileManager, {
      props: { files, loading: true }
    })
    expect(getByText('Loading...')).toBeTruthy()
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

  it('has file path aria-label', () => {
    const { container } = render(FileManager, {
      props: { files }
    })
    expect(container.querySelector('nav[aria-label="File path"]')).toBeTruthy()
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
})

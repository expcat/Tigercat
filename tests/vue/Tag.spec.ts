/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Tag } from '@expcat/tigercat-vue/Tag'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { resetDevWarnCache } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Tag', () => {
  it('renders content without a live region', () => {
    const { container } = render(Tag, {
      slots: {
        default: 'Test Tag'
      }
    })

    expect(screen.getByText('Test Tag')).toBeInTheDocument()
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
  })

  it('lets a user role override the root', () => {
    render(Tag, {
      attrs: { role: 'listitem' },
      slots: { default: 'Item' }
    })
    expect(screen.getByRole('listitem')).toBeInTheDocument()
    expect(screen.getByText('Item')).toBeInTheDocument()
  })

  it('merges attrs.class and props.className', () => {
    const { container } = render(Tag, {
      props: {
        className: 'from-props'
      },
      attrs: {
        class: 'from-attrs'
      },
      slots: {
        default: 'Tag'
      }
    })

    expect(container.firstElementChild).toHaveClass('from-props')
    expect(container.firstElementChild).toHaveClass('from-attrs')
  })

  it('warns when color is passed instead of variant', () => {
    resetDevWarnCache()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    render(Tag, {
      attrs: { color: 'green' },
      slots: { default: 'Color prop' }
    })

    expect(screen.getByText('Color prop')).toBeInTheDocument()
    expect(warn).toHaveBeenCalledWith('[Tigercat] Tag does not support color. Use variant instead.')
    warn.mockRestore()
  })

  it('does not render close button when closable=false', () => {
    const { container } = render(Tag, {
      props: {
        closable: false
      },
      slots: {
        default: 'Tag'
      }
    })

    expect(container.querySelector('button')).not.toBeInTheDocument()
  })

  it('emits close and stays visible unless the parent unmounts it', async () => {
    const onClose = vi.fn()

    render(Tag, {
      props: {
        closable: true,
        onClose
      },
      slots: {
        default: 'Closable Tag'
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Close tag' }))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Closable Tag')).toBeInTheDocument()
  })

  it('hides when the parent removes the item after close', async () => {
    const Host = defineComponent({
      setup() {
        const items = ref(['Alpha', 'Beta'])
        return () =>
          items.value.map((item) =>
            h(
              Tag,
              {
                key: item,
                closable: true,
                onClose: () => {
                  items.value = items.value.filter((x) => x !== item)
                }
              },
              { default: () => item }
            )
          )
      }
    })

    render(Host)
    await fireEvent.click(screen.getAllByRole('button', { name: 'Close tag' })[0])
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
  })

  it('stops propagation when close button is clicked', async () => {
    const onTagClick = vi.fn()

    render(Tag, {
      props: {
        closable: true
      },
      slots: {
        default: 'Closable Tag'
      },
      attrs: {
        onClick: onTagClick
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Close tag' }))
    expect(onTagClick).not.toHaveBeenCalled()
  })

  it('uses official locale objects for the close name', () => {
    const { unmount } = render({
      components: { ConfigProvider, Tag },
      setup: () => ({ zhCN }),
      template: '<ConfigProvider :locale="zhCN"><Tag closable>标签</Tag></ConfigProvider>'
    })
    expect(screen.getByRole('button', { name: '关闭标签' })).toBeInTheDocument()
    unmount()

    render({
      components: { ConfigProvider, Tag },
      setup: () => ({ zhTW }),
      template: '<ConfigProvider :locale="zhTW"><Tag closable>標籤</Tag></ConfigProvider>'
    })
    expect(screen.getByRole('button', { name: '關閉標籤' })).toBeInTheDocument()
  })

  it('renders custom closeAriaLabel on close button', () => {
    render(Tag, {
      props: { closable: true, closeAriaLabel: 'Remove' },
      slots: { default: 'Tag' }
    })

    expect(screen.getByRole('button', { name: 'Remove' })).toBeInTheDocument()
  })

  it('passes a11y baseline checks including closable', async () => {
    const { container } = render(Tag, {
      props: { closable: true },
      slots: { default: 'Accessible Tag' }
    })

    await expectNoA11yViolationsIsolated(container)
  })
})

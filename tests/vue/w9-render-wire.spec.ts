/**
 * @vitest-environment happy-dom
 */
import { defineComponent, h, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { Alert } from '@expcat/tigercat-vue/Alert'
import { Carousel } from '@expcat/tigercat-vue/Carousel'
import { Descriptions, DescriptionsItem } from '@expcat/tigercat-vue/Descriptions'
import { Drawer } from '@expcat/tigercat-vue/Drawer'
import { List } from '@expcat/tigercat-vue/List'
import { LoadingBarContainer } from '@expcat/tigercat-vue/LoadingBarContainer'
import { NotificationContainer } from '@expcat/tigercat-vue/NotificationContainer'
import { Popover } from '@expcat/tigercat-vue/Popover'
import { Row } from '@expcat/tigercat-vue/Row'
import { ScrollArea } from '@expcat/tigercat-vue/ScrollArea'
import { Skeleton } from '@expcat/tigercat-vue/Skeleton'
import { Space } from '@expcat/tigercat-vue/Space'
import { Splitter } from '@expcat/tigercat-vue/Splitter'
import { Tooltip, TooltipDelayProvider } from '@expcat/tigercat-vue/Tooltip'
import { Tour } from '@expcat/tigercat-vue/Tour'
import { Resizable } from '@expcat/tigercat-vue/Resizable'

describe('w9 render wiring', () => {
  it('renders drawer resize handle, alert action, tooltip arrow, and popover arrow', () => {
    const view = render(
      defineComponent({
        setup() {
          return () =>
            h(TooltipDelayProvider, () => [
              h(Drawer, { open: true, resizable: true, title: 'Panel' }, { default: () => 'body' }),
              h(Alert, { title: 'Heads up', type: 'info' }, {
                action: () => h('button', { type: 'button' }, 'Retry')
              }),
              h(Tooltip, { open: true, content: 'Hint' }, { default: () => h('button', 'Tip') }),
              h(
                Popover,
                { open: true, title: 'More', closeOnScroll: true, ariaLabel: 'More' },
                { default: () => h('button', 'Open') }
              )
            ])
        }
      })
    )
    expect(document.querySelector('[data-tiger-drawer-resize]')).toBeTruthy()
    expect(view.getByRole('button', { name: 'Retry' })).toBeTruthy()
    expect(document.querySelectorAll('[data-tiger-floating-arrow]').length).toBeGreaterThan(0)
    view.unmount()
  })

  it('renders notification nodes, tour cover, loading bar duration, and layout props', async () => {
    const view = render(
      defineComponent({
        setup() {
          const target = ref<HTMLButtonElement | null>(null)
          return () =>
            h('div', [
              h(
                NotificationContainer,
                {
                  notifications: [
                    {
                      id: 'n1',
                      title: 'Saved',
                      descriptionNode: 'Details here',
                      actionNode: h('button', { type: 'button' }, 'Undo')
                    }
                  ]
                },
                {}
              ),
              h('button', { ref: target, id: 'tour-target' }, 'Target'),
              h(Tour, {
                open: true,
                steps: [
                  {
                    target: '#tour-target',
                    title: 'Step',
                    cover: 'https://example.com/cover.png',
                    coverAlt: 'Cover',
                    arrow: true,
                    type: 'advanceOnTarget'
                  }
                ]
              }),
              h(LoadingBarContainer, { percentage: 40, status: 'loading', minimumDisplayMs: 400 }),
              h(Splitter, { collapsible: true, sizes: [120, 80] }, {
                default: () => [h('div', 'A'), h('div', 'B')]
              }),
              h(Resizable, { lockAspectRatio: '16/9', width: 160, height: 90 }, {
                default: () => 'box'
              }),
              h(ScrollArea, { nativeBars: true, height: 80 }, {
                default: () => h('div', { id: 'marker-1', style: { height: '200px' } }, 'scroll')
              }),
              h(Carousel, { axis: 'vertical', slidesPerView: 2, thumbnails: true, dots: false }, {
                default: () => [h('div', 'One'), h('div', 'Two'), h('div', 'Three')]
              }),
              h(List, { dataSource: [{ title: 'Ada' }], loading: false }, {
                item: () => 'Ada Lovelace',
                meta: () => 'Scientist',
                actions: () => h('button', { type: 'button' }, 'Edit')
              }),
              h(Skeleton, { loading: false }, { default: () => 'Ready' }),
              h(Descriptions, { items: [] }, {
                default: () =>
                  h(DescriptionsItem, { label: 'Name' }, { default: () => 'Ada' })
              }),
              h(Space, { size: 8, verticalSize: 4, split: true }, {
                default: () => [h('span', 'Left'), h('span', 'Right')],
                split: () => '/'
              }),
              h(Row, { gutter: { xs: 4, lg: [12, 8] } }, { default: () => h('div', 'cell') })
            ])
        }
      })
    )
    expect(view.getByRole('button', { name: 'Undo' })).toBeTruthy()
    expect(view.getByText('Details here')).toBeTruthy()
    expect(document.querySelector('[data-tiger-tour-cover]')).toBeTruthy()
    expect(document.querySelector('[data-tiger-tour-arrow]')).toBeTruthy()
    expect(document.querySelector('[data-minimum-display-ms]')?.getAttribute('data-minimum-display-ms')).toBe(
      '400'
    )
    expect(document.querySelector('[data-tiger-splitter-collapse]')).toBeTruthy()
    expect(document.querySelector('[data-resizable]')).toBeTruthy()
    expect(document.querySelector('[data-native-bars]')).toBeTruthy()
    expect(document.querySelector('[data-axis="vertical"]')).toBeTruthy()
    expect(document.querySelector('[data-tiger-carousel-thumb]')).toBeTruthy()
    expect(view.getByText('Ada Lovelace')).toBeTruthy()
    expect(view.getByRole('button', { name: 'Edit' })).toBeTruthy()
    expect(view.getByText('Ready')).toBeTruthy()
    expect(view.getByText('Ada')).toBeTruthy()
    expect(document.querySelector('[data-tiger-space-split]')?.textContent).toBe('/')
    const row = view.getByText('cell').parentElement as HTMLElement
    expect(row.style.getPropertyValue('--tiger-row-gutter-x')).not.toBe('')
    const root = document.querySelector('[data-scroll-area]') as HTMLElement & {
      scrollToMarker?: (id: string) => void
    }
    expect(typeof root.scrollToMarker).toBe('function')
    root.scrollToMarker('marker-1')
    await fireEvent.click(document.querySelector('[data-tiger-splitter-collapse]') as Element)
    expect(document.querySelector('[data-collapsed]')).toBeTruthy()
    view.unmount()
  })
})

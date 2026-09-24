/**
 * @vitest-environment happy-dom
 */
import React from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { Alert } from '@expcat/tigercat-react/Alert'
import { Carousel } from '@expcat/tigercat-react/Carousel'
import { Descriptions, DescriptionsItem } from '@expcat/tigercat-react/Descriptions'
import { Drawer } from '@expcat/tigercat-react/Drawer'
import { List } from '@expcat/tigercat-react/List'
import { LoadingBarContainer } from '@expcat/tigercat-react/LoadingBarContainer'
import { Modal } from '@expcat/tigercat-react/Modal'
import { NotificationContainer } from '@expcat/tigercat-react/NotificationContainer'
import { Popover } from '@expcat/tigercat-react/Popover'
import { Resizable } from '@expcat/tigercat-react/Resizable'
import { Row } from '@expcat/tigercat-react/Row'
import { ScrollArea } from '@expcat/tigercat-react/ScrollArea'
import { Sidebar } from '@expcat/tigercat-react/Sidebar'
import { Skeleton } from '@expcat/tigercat-react/Skeleton'
import { Space } from '@expcat/tigercat-react/Space'
import { Splitter } from '@expcat/tigercat-react/Splitter'
import { Tooltip, TooltipDelayProvider } from '@expcat/tigercat-react/Tooltip'
import { Tour } from '@expcat/tigercat-react/Tour'

describe('w9 render wiring', () => {
  it('renders the wired props in React', async () => {
    const view = render(
      <TooltipDelayProvider>
        <Drawer open resizable title="Panel">
          body
        </Drawer>
        <Modal open mobileSheet title="Sheet">
          sheet
        </Modal>
        <Alert title="Heads up" type="info" action={<button type="button">Retry</button>} />
        <Tooltip open content="Hint">
          <button type="button">Tip</button>
        </Tooltip>
        <Popover open title="More" closeOnScroll ariaLabel="More">
          <button type="button">Open</button>
        </Popover>
        <NotificationContainer
          notifications={[
            {
              id: 'n1',
              title: 'Saved',
              descriptionNode: 'Details here',
              actionNode: <button type="button">Undo</button>
            }
          ]}
        />
        <button id="tour-target" type="button">
          Target
        </button>
        <Tour
          open
          steps={[
            {
              target: '#tour-target',
              title: 'Step',
              cover: 'https://example.com/cover.png',
              coverAlt: 'Cover',
              arrow: true,
              type: 'advanceOnTarget'
            }
          ]}
        />
        <LoadingBarContainer percentage={40} status="loading" minimumDisplayMs={400} />
        <Splitter collapsible sizes={[120, 80]}>
          <div>A</div>
          <div>B</div>
        </Splitter>
        <Resizable lockAspectRatio="16/9" width={160} height={90}>
          box
        </Resizable>
        <ScrollArea nativeBars height={80}>
          <div id="marker-1" style={{ height: 200 }}>
            scroll
          </div>
        </ScrollArea>
        <Carousel axis="vertical" slidesPerView={2} thumbnails dots={false}>
          <div>One</div>
          <div>Two</div>
          <div>Three</div>
        </Carousel>
        <List
          dataSource={[{ title: 'Ada' }]}
          item={() => 'Ada Lovelace'}
          meta={() => 'Scientist'}
          actions={() => <button type="button">Edit</button>}
        />
        <Skeleton loading={false}>Ready</Skeleton>
        <Descriptions items={[]}>
          <DescriptionsItem label="Name">Ada</DescriptionsItem>
        </Descriptions>
        <Space size={8} verticalSize={4} split="/">
          <span>Left</span>
          <span>Right</span>
        </Space>
        <Row gutter={{ xs: 4, lg: [12, 8] }}>
          <div>cell</div>
        </Row>
        <Sidebar collapsible collapsedWidth="0px">
          nav
        </Sidebar>
      </TooltipDelayProvider>
    )
    expect(document.querySelector('[data-tiger-drawer-resize]')).toBeTruthy()
    expect(view.getByRole('button', { name: 'Retry' })).toBeTruthy()
    expect(document.querySelectorAll('[data-tiger-floating-arrow]').length).toBeGreaterThan(0)
    expect(view.getByRole('button', { name: 'Undo' })).toBeTruthy()
    expect(view.getByText('Details here')).toBeTruthy()
    expect(document.querySelector('[data-tiger-tour-cover]')).toBeTruthy()
    expect(document.querySelector('[data-tiger-tour-arrow]')).toBeTruthy()
    expect(
      document.querySelector('[data-minimum-display-ms]')?.getAttribute('data-minimum-display-ms')
    ).toBe('400')
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
    expect(document.querySelector('[data-tiger-sidebar-trigger]')).toBeTruthy()
    const root = document.querySelector('[data-scroll-area]') as HTMLElement & {
      scrollToMarker?: (id: string) => void
    }
    expect(typeof root.scrollToMarker).toBe('function')
    await fireEvent.click(document.querySelector('[data-tiger-splitter-collapse]') as Element)
    expect(document.querySelector('[data-collapsed]')).toBeTruthy()
    view.unmount()
  })
})

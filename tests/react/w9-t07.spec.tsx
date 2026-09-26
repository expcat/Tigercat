/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import {
  applyPopupMenuCheck,
  clampPaginationJump,
  isStepClickable,
  nextAffixNotice,
  nextTreeRangeSelection,
  orderSpotlightWithRecent,
  resolveFloatButtonHref,
  resolveSectionActiveHref,
  splitOverflowTabKeys,
  type PopupMenuItem
} from '@expcat/tigercat-core'
import { Affix } from '@expcat/tigercat-react/Affix'
import { Anchor, AnchorLink } from '@expcat/tigercat-react/Anchor'
import { Breadcrumb, BreadcrumbItem } from '@expcat/tigercat-react/Breadcrumb'
import { ContextMenu } from '@expcat/tigercat-react/ContextMenu'
import { Dropdown } from '@expcat/tigercat-react/Dropdown'
import { FloatButton, FloatButtonGroup } from '@expcat/tigercat-react/FloatButton'
import { Menu } from '@expcat/tigercat-react/Menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger
} from '@expcat/tigercat-react/NavigationMenu'
import { PageHeader } from '@expcat/tigercat-react/PageHeader'
import { Pagination } from '@expcat/tigercat-react/Pagination'
import { ScrollSpy } from '@expcat/tigercat-react/ScrollSpy'
import { Spotlight } from '@expcat/tigercat-react/Spotlight'
import { Steps, StepsItem } from '@expcat/tigercat-react/Steps'
import { TabPane, Tabs } from '@expcat/tigercat-react/Tabs'
import { Tree } from '@expcat/tigercat-react/Tree'
import { MockIntersectionObserver, MockResizeObserver } from '../utils/mock-observers'

describe('react W9 T07', () => {
  it('E5 E10 E13 E14 core helpers match vue', () => {
    expect(nextTreeRangeSelection({ visibleKeys: [1, 2, 3], anchor: 1, key: 3 }).keys).toEqual([
      1, 2, 3
    ])
    expect(splitOverflowTabKeys({ keys: ['a'], widths: [10], available: 100 }).overflow).toEqual([])
    expect(clampPaginationJump('2', 5)).toBe(2)
    expect(isStepClickable(true, false, 'error')).toBe(true)
    expect(orderSpotlightWithRecent([{ key: 'a', label: 'A' }], ['a'])[0]?.key).toBe('a')
    expect(resolveFloatButtonHref('/a')).toBe('/a')
    expect(resolveSectionActiveHref('#a', '#b')).toBe('#a')
    expect(nextAffixNotice(false, true)).toBe(true)
  })

  it('E8 E9 E10 E11 render', () => {
    const page = render(
      <PageHeader
        title="Page"
        backHref="/back"
        tabs={<span>Tab slot</span>}
        footer={<span>Footer slot</span>}
      />
    )
    expect(page.getByText('Tab slot')).toBeTruthy()
    page.unmount()

    const fab = render(<FloatButton href="/inbox" ariaLabel="Inbox" />)
    expect(fab.getByRole('link', { name: 'Inbox' }).getAttribute('href')).toBe('/inbox')
    fab.unmount()

    const pages = render(<Pagination total={200} ellipsisJump />)
    expect(pages.getAllByLabelText('Go to page').length).toBeGreaterThan(0)
    pages.unmount()

    const steps = render(
      <Steps progressDot clickable current={1} status="error">
        <StepsItem title="One" />
        <StepsItem title="Two" />
      </Steps>
    )
    expect(steps.container.querySelector('.tiger-step-icon--dot')).toBeTruthy()
  })

  it('E1 renders checkbox, radio, submenu, and shortcut', () => {
    const items: PopupMenuItem[] = [
      { key: 'check', type: 'checkbox', label: 'Pin', checked: false },
      { key: 'radio', type: 'radio', label: 'Grid', group: 'view', checked: true },
      { key: 'save', label: 'Save', shortcut: '⌘S' },
      {
        key: 'more',
        type: 'submenu',
        label: 'More',
        children: [{ key: 'nested', label: 'Nested' }]
      }
    ]
    function Harness() {
      const [menuItems, setMenuItems] = useState(items)
      return (
        <Dropdown
          open
          items={menuItems}
          onCheck={(change) => setMenuItems(applyPopupMenuCheck(menuItems, change))}>
          <button type="button">Open</button>
        </Dropdown>
      )
    }
    render(<Harness />)
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: 'Pin' }))
    expect(screen.getByRole('menuitemcheckbox', { name: 'Pin' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByRole('menuitemradio', { name: 'Grid' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByText('⌘S')).toBeTruthy()
    fireEvent.mouseEnter(screen.getByRole('menuitem', { name: 'More' }))
    expect(screen.getByRole('menuitem', { name: 'Nested' })).toBeTruthy()

    render(
      <ContextMenu open items={[{ key: 'cut', type: 'danger', label: 'Cut', shortcut: '⌘X' }]}>
        <span>Target</span>
      </ContextMenu>
    )
    expect(screen.getByRole('menuitem', { name: /Cut/ })).toBeTruthy()
    expect(screen.getByText('⌘X')).toBeTruthy()
  })

  it('E2 renders a collapsed tooltip and badge', async () => {
    render(<Menu collapsed items={[{ key: 'inbox', label: 'Inbox', badge: 4, shortcut: 'I' }]} />)
    expect(screen.getByText('4')).toBeTruthy()
    fireEvent.focus(screen.getByRole('menuitem'))
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Inbox'))
  })

  it('E3 shares a viewport and shows the current indicator', () => {
    render(
      <NavigationMenu current="docs" viewport>
        <NavigationMenuList>
          <NavigationMenuItem value="docs">
            <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
            <NavigationMenuContent>Docs body</NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    )
    expect(document.querySelector('[data-tiger-navigation-viewport="true"]')).toBeTruthy()
    expect(document.querySelector('[data-tiger-navigation-indicator]')).toBeTruthy()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Docs' }))
    expect(document.querySelector('[data-tiger-navigation-viewport-panel]')).toHaveTextContent(
      'Docs body'
    )
  })

  it('E4 overflows into a more menu, keeps manual activation, and renders label nodes', () => {
    const rect = HTMLElement.prototype.getBoundingClientRect
    const clientWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
    const clientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight')
    HTMLElement.prototype.getBoundingClientRect = function () {
      if (this.getAttribute('role') === 'tab') return new DOMRect(0, 0, 80, 32)
      if (this.getAttribute('role') === 'tablist') return new DOMRect(0, 0, 100, 32)
      return rect.call(this)
    }
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get() {
        return this.getAttribute('role') === 'tablist' ? 100 : 0
      }
    })
    Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
      configurable: true,
      get() {
        return this.getAttribute('role') === 'tablist' ? 32 : 0
      }
    })
    render(
      <Tabs activation="manual" defaultActiveKey="a">
        <TabPane tabKey="a" label="Alpha" />
        <TabPane tabKey="b" label={<em>Beta node</em>} />
        <TabPane tabKey="c" label="Gamma" />
      </Tabs>
    )
    expect(screen.getByText('Beta node')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'More' })).toBeTruthy()
    const alpha = screen.getByRole('tab', { name: 'Alpha' })
    fireEvent.keyDown(alpha, { key: 'ArrowRight' })
    expect(alpha).toHaveAttribute('aria-selected', 'true')
    HTMLElement.prototype.getBoundingClientRect = rect
    if (clientWidth) Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidth)
    if (clientHeight) Object.defineProperty(HTMLElement.prototype, 'clientHeight', clientHeight)
  })

  it('E5 shift-selects a range and expands on title click', () => {
    const onSelect = vi.fn()
    const range = render(
      <Tree
        selectionMode="multiple"
        onSelect={onSelect}
        treeData={[
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B' },
          { key: 'c', label: 'C' }
        ]}
      />
    )
    fireEvent.click(screen.getByText('A'))
    fireEvent.click(screen.getByText('C'), { shiftKey: true })
    expect(onSelect).toHaveBeenLastCalledWith(['a', 'b', 'c'], expect.anything())
    range.unmount()

    render(
      <Tree
        expandOnClick
        treeData={[
          {
            key: 'dir',
            label: 'Folder',
            directory: true,
            children: [{ key: 'leaf', label: 'Leaf' }]
          }
        ]}
      />
    )
    expect(document.querySelector('[data-tiger-tree-directory]')).toBeTruthy()
    fireEvent.click(screen.getByText('Folder'))
    expect(screen.getByText('Leaf')).toBeTruthy()
  })

  it('E6 highlights the typeahead match', () => {
    render(
      <Menu
        items={[
          { key: 'apple', label: 'Apple' },
          { key: 'banana', label: 'Banana' }
        ]}
      />
    )
    const apple = screen.getByRole('menuitem', { name: 'Apple' })
    apple.focus()
    fireEvent.keyDown(apple, { key: 'b' })
    expect(screen.getByRole('menuitem', { name: 'Banana' })).toHaveAttribute(
      'data-tiger-typeahead-match',
      'true'
    )
  })

  it('E7 opens a menu of collapsed breadcrumb items', () => {
    render(
      <Breadcrumb maxItems={3}>
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbItem href="/a">A</BreadcrumbItem>
        <BreadcrumbItem href="/b">B</BreadcrumbItem>
        <BreadcrumbItem>Now</BreadcrumbItem>
      </Breadcrumb>
    )
    fireEvent.click(screen.getByRole('button', { name: /collapsed/i }))
    expect(screen.getByRole('menu')).toBeTruthy()
  })

  it('E9 renders a link badge and a group tooltip', async () => {
    const link = render(<FloatButton href="/inbox" badge={3} ariaLabel="Inbox" />)
    expect(link.getByRole('link', { name: 'Inbox' })).toHaveAttribute('href', '/inbox')
    expect(link.getByText('3')).toBeTruthy()
    link.unmount()

    render(
      <FloatButtonGroup open>
        <FloatButton tooltip="Inbox tip" ariaLabel="Compose" />
      </FloatButtonGroup>
    )
    fireEvent.focus(screen.getByRole('button', { name: 'Compose' }))
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Inbox tip'))
  })

  it('E10 renders a page jump and itemRender', () => {
    render(<Pagination total={80} ellipsisJump itemRender={(page) => <span>{`p${page}`}</span>} />)
    expect(screen.getAllByLabelText('Go to page').length).toBeGreaterThan(0)
    expect(screen.getByText('p1')).toBeTruthy()
  })

  it('E11 lets an error step be clicked when clickable', () => {
    const onChange = vi.fn()
    render(
      <Steps clickable current={1} onChange={onChange}>
        <StepsItem title="Bad" status="error" />
        <StepsItem title="Next" />
      </Steps>
    )
    fireEvent.click(screen.getByText('Bad'))
    expect(onChange).toHaveBeenCalledWith(0)
  })

  it('E12 shows each shortcut once on its row', () => {
    render(
      <Spotlight
        open
        recentIds={['recent']}
        items={[
          { key: 'late', label: 'Late', shortcut: '⌘L' },
          { key: 'recent', label: 'Recent', shortcut: '⌘K' },
          { key: 'locked', label: 'Locked', shortcut: '⌘X', disabled: true }
        ]}
      />
    )
    const options = screen.getAllByRole('option')
    expect(options.map((option) => option.textContent)).toEqual([
      expect.stringContaining('Recent'),
      expect.stringContaining('Late'),
      expect.stringContaining('Locked')
    ])
    expect(options.map((option) => option.querySelector('kbd')?.textContent)).toEqual([
      '⌘K',
      '⌘L',
      '⌘X'
    ])
    expect(document.querySelectorAll('kbd')).toHaveLength(3)
    expect(document.querySelector('[data-tiger-spotlight-footer]')).toBeNull()
  })

  it('E13 renders the shared section scroll model', () => {
    const anchor = render(
      <Anchor>
        <AnchorLink href="#one" title="One" />
      </Anchor>
    )
    expect(anchor.container.querySelector('[data-tiger-section-behavior]')).toBeTruthy()
    anchor.unmount()
    const spy = render(
      <ScrollSpy items={[{ key: 'one', href: '#one', label: 'One' }]} activeKey="one" />
    )
    expect(spy.container.querySelector('[data-tiger-section-active]')).toHaveAttribute(
      'data-tiger-section-active',
      '#one'
    )
  })

  it('E14 notifies stuck once as a boolean', async () => {
    MockIntersectionObserver.reset()
    MockResizeObserver.reset()
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
    const onChange = vi.fn()
    render(
      <Affix offsetTop={10} data-testid="stuck" onChange={onChange}>
        Pinned
      </Affix>
    )
    const content = screen.getByTestId('stuck')
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 100, 30))
    await waitFor(() => expect(MockIntersectionObserver.instances.length).toBeGreaterThan(0))
    const observer =
      MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]
    observer.trigger({
      isIntersecting: false,
      boundingClientRect: new DOMRect(0, -1, 0, 0),
      rootBounds: new DOMRect(0, 0, 100, 600)
    })
    observer.trigger({
      isIntersecting: false,
      boundingClientRect: new DOMRect(0, -8, 0, 0),
      rootBounds: new DOMRect(0, 0, 100, 600)
    })
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    expect(onChange).toHaveBeenCalledWith(true)
    vi.unstubAllGlobals()
  })
})

import {
  defineComponent,
  computed,
  ref,
  watch,
  provide,
  inject,
  PropType,
  h,
  Fragment,
  getCurrentInstance,
  type VNode,
  type Component
} from 'vue'
import {
  classNames,
  closeIconPathD,
  closeIconViewBox,
  getTabsContainerClasses,
  getTabItemClasses,
  getTabNavClasses,
  getTabNavListClasses,
  getTabNavListStyle,
  getTabPaneClasses,
  getTabIndicatorClasses,
  getTabIndicatorStyle,
  getGestureTouchPoint,
  resolveSwipeGesture,
  isKeyActive,
  getNextActiveKey,
  tabAddButtonClasses,
  tabCloseButtonClasses,
  tabContentBaseClasses,
  type TabType,
  type TabPosition,
  type TabSize
} from '@expcat/tigercat-core'

// Tabs context key
export const TabsContextKey = Symbol('TabsContext')

// Tabs context interface
export interface TabsContext {
  activeKey: string | number | undefined
  type: TabType
  size: TabSize
  tabPosition: TabPosition
  closable: boolean
  destroyInactiveTabPane: boolean
  lazy: boolean
  swipeable: boolean
  idBase: string
  handleTabClick: (key: string | number) => void
  handleTabClose: (key: string | number, event: Event) => void
}

export interface VueTabsProps {
  activeKey?: string | number
  defaultActiveKey?: string | number
  type?: TabType
  tabPosition?: TabPosition
  size?: TabSize
  closable?: boolean
  centered?: boolean
  destroyInactiveTabPane?: boolean
  /** Whether inactive tab panes are mounted lazily (on first activation) */
  lazy?: boolean
  swipeable?: boolean
  className?: string
  style?: Record<string, string | number>
}

export interface VueTabPaneProps {
  tabKey: string | number
  label: string
  disabled?: boolean
  closable?: boolean
  icon?: string | VNode
  className?: string
  style?: Record<string, string | number>
}

export const TabPane = defineComponent({
  name: 'TigerTabPane',
  props: {
    /**
     * Unique key for the tab pane (required)
     */
    tabKey: {
      type: [String, Number] as PropType<string | number>,
      required: true
    },
    /**
     * Tab label/title
     */
    label: {
      type: String,
      required: true
    },
    /**
     * Whether the tab is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the tab can be closed (overrides parent closable)
     */
    closable: {
      type: Boolean,
      default: undefined
    },
    /**
     * Icon for the tab
     */
    icon: {
      type: [String, Object] as PropType<string | VNode>,
      default: undefined
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    /**
     * Render mode - 'tab' for tab item, 'pane' for content pane
     * @internal
     */
    renderMode: {
      type: String as PropType<'tab' | 'pane'>,
      default: 'pane'
    },

    // Internal props for a11y + roving tabindex
    tabId: {
      type: String,
      default: undefined
    },
    panelId: {
      type: String,
      default: undefined
    },
    tabIndex: {
      type: Number,
      default: undefined
    }
  },
  setup(props, { slots }) {
    const tabsContext = inject<TabsContext>(TabsContextKey)

    if (!tabsContext) {
      throw new Error('TabPane must be used within a Tabs component')
    }

    const isActive = computed(() => {
      return isKeyActive(props.tabKey, tabsContext.activeKey)
    })

    const hasBeenActivated = ref(isActive.value)
    watch(isActive, (val) => {
      if (val) hasBeenActivated.value = true
    })

    const isClosable = computed(() => {
      return props.closable !== undefined
        ? props.closable
        : tabsContext.closable && tabsContext.type === 'editable-card'
    })

    const tabItemClasses = computed(() => {
      return getTabItemClasses(isActive.value, props.disabled, tabsContext.type, tabsContext.size)
    })

    const tabPaneClasses = computed(() => {
      return classNames(getTabPaneClasses(isActive.value), props.className)
    })

    const handleClick = () => {
      if (!props.disabled) {
        tabsContext.handleTabClick(props.tabKey)
      }
    }

    const handleClose = (event: Event) => {
      // The close control is nested inside the tab; prevent the click from
      // bubbling up and activating the tab it is closing.
      event.stopPropagation()
      if (!props.disabled) {
        tabsContext.handleTabClose(props.tabKey, event)
      }
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled) {
        return
      }

      if (isClosable.value && (event.key === 'Backspace' || event.key === 'Delete')) {
        event.preventDefault()
        tabsContext.handleTabClose(props.tabKey, event)
        return
      }

      const isVertical = tabsContext.tabPosition === 'left' || tabsContext.tabPosition === 'right'

      const nextKeys = isVertical ? ['ArrowDown'] : ['ArrowRight']
      const prevKeys = isVertical ? ['ArrowUp'] : ['ArrowLeft']

      const key = event.key
      if (
        nextKeys.includes(key) ||
        prevKeys.includes(key) ||
        key === 'Home' ||
        key === 'End' ||
        key === 'Enter' ||
        key === ' '
      ) {
        event.preventDefault()
      }

      if (key === 'Enter' || key === ' ') {
        tabsContext.handleTabClick(props.tabKey)
        return
      }

      const tabList = (event.currentTarget as HTMLElement | null)?.closest('[role="tablist"]')

      const tabButtons = Array.from(tabList?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])

      const enabled = tabButtons.filter((button) => button.getAttribute('aria-disabled') !== 'true')
      const currentIndex = enabled.findIndex((button) => button.id === props.tabId)
      if (currentIndex === -1) {
        return
      }

      const focusByIndex = (index: number) => {
        const next = enabled[index]
        if (!next) return
        next.focus()

        const nextKey = next.getAttribute('data-tiger-tab-key')
        if (nextKey != null) {
          const parsed: string | number = nextKey.startsWith('n:')
            ? Number(nextKey.slice(2))
            : nextKey.startsWith('s:')
              ? nextKey.slice(2)
              : nextKey
          tabsContext.handleTabClick(parsed)
        }
      }

      if (nextKeys.includes(key)) {
        focusByIndex((currentIndex + 1) % enabled.length)
        return
      }

      if (prevKeys.includes(key)) {
        focusByIndex((currentIndex - 1 + enabled.length) % enabled.length)
        return
      }

      if (key === 'Home') {
        focusByIndex(0)
        return
      }

      if (key === 'End') {
        focusByIndex(enabled.length - 1)
      }
    }

    return () => {
      if (props.renderMode === 'tab') {
        // The tab is a `div[role="tab"]` (not a native button) so the closable
        // variant can nest a real `<button>` close control without nesting an
        // interactive button inside another button (C06-3).
        return h(
          'div',
          {
            class: tabItemClasses.value,
            role: 'tab',
            id: props.tabId,
            'aria-controls': props.panelId,
            'aria-selected': isActive.value,
            'aria-disabled': props.disabled,
            tabindex: props.disabled
              ? -1
              : typeof props.tabIndex === 'number'
                ? props.tabIndex
                : isActive.value
                  ? 0
                  : -1,
            'data-tiger-tabs-id': tabsContext.idBase,
            'data-tiger-tab-key':
              typeof props.tabKey === 'number' ? `n:${props.tabKey}` : `s:${props.tabKey}`,
            onClick: handleClick,
            onKeydown: handleKeydown
          },
          [
            props.icon && h('span', { class: 'flex items-center' }, props.icon),
            h('span', props.label),
            isClosable.value &&
              h(
                'button',
                {
                  type: 'button',
                  class: tabCloseButtonClasses,
                  'aria-label': `Close ${String(props.label)}`,
                  tabindex: -1,
                  onClick: handleClose
                },
                h(
                  'svg',
                  {
                    class: 'w-4 h-4',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: closeIconViewBox
                  },
                  h('path', {
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': '2',
                    d: closeIconPathD
                  })
                )
              )
          ]
        )
      }

      const shouldRender = tabsContext.lazy
        ? hasBeenActivated.value && (isActive.value || !tabsContext.destroyInactiveTabPane)
        : isActive.value || !tabsContext.destroyInactiveTabPane
      if (!shouldRender) {
        return null
      }

      return h(
        'div',
        {
          class: tabPaneClasses.value,
          style: props.style,
          role: 'tabpanel',
          id: props.panelId,
          'aria-labelledby': props.tabId,
          'aria-hidden': !isActive.value
        },
        slots.default?.()
      )
    }
  }
})

export const Tabs = defineComponent({
  name: 'TigerTabs',
  props: {
    /**
     * Currently active tab key
     */
    activeKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    /**
     * Default active tab key (for uncontrolled mode)
     */
    defaultActiveKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    /**
     * Tab type - line, card, or editable-card
     * @default 'line'
     */
    type: {
      type: String as PropType<TabType>,
      default: 'line' as TabType
    },
    /**
     * Tab position - top, bottom, left, or right
     * @default 'top'
     */
    tabPosition: {
      type: String as PropType<TabPosition>,
      default: 'top' as TabPosition
    },
    /**
     * Tab size - small, medium, or large
     * @default 'medium'
     */
    size: {
      type: String as PropType<TabSize>,
      default: 'medium' as TabSize
    },
    /**
     * Whether tabs can be closed (only works with editable-card type)
     * @default false
     */
    closable: {
      type: Boolean,
      default: false
    },
    /**
     * Whether tabs are centered
     * @default false
     */
    centered: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to destroy inactive tab panes
     * @default false
     */
    destroyInactiveTabPane: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to lazily render tab panes (only render when first activated)
     * @default false
     * @since 0.6.0
     */
    lazy: {
      type: Boolean,
      default: false
    },
    /**
     * Whether horizontal touch swipes switch tabs.
     * @default true
     */
    swipeable: {
      type: Boolean,
      default: true
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },
    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['update:activeKey', 'change', 'edit', 'tab-click'],
  setup(props, { slots, emit }) {
    const instance = getCurrentInstance()
    const idBase = `tiger-tabs-${instance?.uid ?? '0'}`

    // Internal state for uncontrolled mode
    const internalActiveKey = ref<string | number | undefined>(props.defaultActiveKey)
    const swipeStart = ref<ReturnType<typeof getGestureTouchPoint> | null>(null)
    // Snapshot of the rendered tab keys (updated each render); used by close
    // handling to compute the next active key without re-walking slots.
    let lastTabKeys: Array<string | number> = []

    // Computed active key (controlled or uncontrolled)
    const currentActiveKey = computed(() => {
      return props.activeKey !== undefined ? props.activeKey : internalActiveKey.value
    })

    // Handle tab click
    const handleTabClick = (key: string | number) => {
      emit('tab-click', key)

      if (currentActiveKey.value === key) return

      // Update internal state if uncontrolled
      if (props.activeKey === undefined) {
        internalActiveKey.value = key
      }

      emit('update:activeKey', key)
      emit('change', key)
    }

    // Handle tab close
    const handleTabClose = (key: string | number, event: Event) => {
      event.stopPropagation()
      // In uncontrolled mode, move the active key off a closed active tab.
      if (props.activeKey === undefined && key === currentActiveKey.value) {
        internalActiveKey.value = getNextActiveKey(key, currentActiveKey.value, lastTabKeys)
      }
      emit('edit', { targetKey: key, action: 'remove' })
    }

    const activateAdjacentTab = (direction: 1 | -1, enabledTabKeys: Array<string | number>) => {
      if (enabledTabKeys.length <= 1) return
      const currentIndex = enabledTabKeys.indexOf(currentActiveKey.value ?? enabledTabKeys[0])
      const baseIndex = currentIndex >= 0 ? currentIndex : 0
      const nextKey =
        enabledTabKeys[(baseIndex + direction + enabledTabKeys.length) % enabledTabKeys.length]
      handleTabClick(nextKey)
    }

    const handleContentTouchStart = (event: TouchEvent) => {
      if (!props.swipeable || event.touches.length !== 1) return
      swipeStart.value = getGestureTouchPoint(event.touches, event.timeStamp)
    }

    const handleContentTouchEnd = (event: TouchEvent, enabledTabKeys: Array<string | number>) => {
      if (!props.swipeable || !swipeStart.value || event.changedTouches.length !== 1) return
      const endPoint = getGestureTouchPoint(event.changedTouches, event.timeStamp)
      const swipe = resolveSwipeGesture(swipeStart.value, endPoint, {
        minDistance: 48,
        maxCrossAxisRatio: 0.75
      })
      swipeStart.value = null
      if (!swipe) return
      if (swipe.direction === 'left') activateAdjacentTab(1, enabledTabKeys)
      if (swipe.direction === 'right') activateAdjacentTab(-1, enabledTabKeys)
    }

    // Container classes
    const containerClasses = computed(() => {
      return classNames(getTabsContainerClasses(props.tabPosition), props.className)
    })

    // Tab nav classes
    const tabNavClasses = computed(() => {
      return getTabNavClasses(props.tabPosition, props.type)
    })

    // Tab nav list classes
    const tabNavListClasses = computed(() => {
      return getTabNavListClasses(props.tabPosition, props.centered)
    })

    // Provide tabs context via plain object with getters — reactive props
    // are tracked automatically when the consumer reads them in a computed/render.
    provide<TabsContext>(TabsContextKey, {
      get activeKey() {
        return currentActiveKey.value
      },
      get type() {
        return props.type
      },
      get size() {
        return props.size
      },
      get tabPosition() {
        return props.tabPosition
      },
      get closable() {
        return props.closable
      },
      get destroyInactiveTabPane() {
        return props.destroyInactiveTabPane
      },
      get lazy() {
        return props.lazy
      },
      get swipeable() {
        return props.swipeable
      },
      idBase,
      handleTabClick,
      handleTabClose
    })

    return () => {
      const rawChildren = (slots.default?.() || []) as VNode[]

      // Flatten Fragment VNodes (produced by v-for) into a flat list
      const children: VNode[] = []
      const flatten = (vnodes: VNode[]) => {
        for (const vnode of vnodes) {
          if (vnode.type === Fragment && Array.isArray(vnode.children)) {
            flatten(vnode.children as VNode[])
          } else {
            children.push(vnode)
          }
        }
      }
      flatten(rawChildren)

      // Extract tab items (for nav) and tab panes (for content)
      const tabItems: VNode[] = []
      const tabPanes: VNode[] = []
      const tabKeys: Array<string | number> = []
      const enabledTabKeys: Array<string | number> = []
      let firstTabKey: string | number | undefined

      // First pass: collect valid TabPane children and determine firstTabKey
      type ChildInfo = {
        type: string | Component
        props: Record<string, unknown>
        children: unknown
      }
      const validChildren: ChildInfo[] = []

      for (const child of children) {
        const childType = child?.type
        const childName =
          typeof childType === 'object' && childType && 'name' in childType
            ? (childType as { name?: string }).name
            : undefined

        if (childName !== 'TigerTabPane') continue

        const childProps = (child.props ?? {}) as Record<string, unknown>
        const k = childProps.tabKey
        if (firstTabKey === undefined && (typeof k === 'string' || typeof k === 'number')) {
          firstTabKey = k
        }
        if (typeof k === 'string' || typeof k === 'number') {
          tabKeys.push(k)
          if (childProps.disabled !== true) {
            enabledTabKeys.push(k)
          }
        }

        const tabPaneType =
          typeof child.type === 'string' || typeof child.type === 'object'
            ? (child.type as string | Component)
            : 'div'

        validChildren.push({ type: tabPaneType, props: childProps, children: child.children })
      }

      // Auto-activate first tab when no key is specified
      if (
        props.activeKey === undefined &&
        internalActiveKey.value === undefined &&
        firstTabKey !== undefined
      ) {
        internalActiveKey.value = firstTabKey
      }

      // Snapshot keys for the close handler (next-active-key computation)
      lastTabKeys = tabKeys

      // Compute resolvedActiveKey once for roving tabindex
      const resolvedActiveKey = currentActiveKey.value ?? firstTabKey
      const activeTabIndex = tabKeys.indexOf(resolvedActiveKey ?? '')

      // Second pass: build tab items and panes
      for (const { type, props: childProps, children: childChildren } of validChildren) {
        const tabId = `${idBase}-tab-${String(childProps.tabKey ?? '')}`
        const panelId = `${idBase}-panel-${String(childProps.tabKey ?? '')}`

        tabItems.push(
          h(type, {
            ...childProps,
            renderMode: 'tab',
            tabId,
            panelId,
            tabIndex: childProps.tabKey === resolvedActiveKey ? 0 : -1
          })
        )
        tabPanes.push(
          h(
            type,
            { ...childProps, renderMode: 'pane', tabId, panelId },
            childChildren as VNode[] | undefined
          )
        )
      }

      // Render tab nav
      const tabNavContent = h(
        'div',
        {
          class: tabNavClasses.value,
          role: 'tablist',
          'aria-orientation':
            props.tabPosition === 'left' || props.tabPosition === 'right'
              ? 'vertical'
              : 'horizontal'
        },
        [
          h(
            'div',
            {
              class: tabNavListClasses.value,
              style: getTabNavListStyle(props.type, props.tabPosition, tabKeys.length)
            },
            [
              props.type === 'line'
                ? h('div', {
                    'data-tiger-tabs-indicator': 'true',
                    'aria-hidden': 'true',
                    class: getTabIndicatorClasses(props.type, props.tabPosition),
                    style: getTabIndicatorStyle(activeTabIndex, tabKeys.length, props.tabPosition)
                  })
                : null,
              ...tabItems,
              props.type === 'editable-card'
                ? h(
                    'button',
                    {
                      type: 'button',
                      class: tabAddButtonClasses,
                      onClick: () => emit('edit', { targetKey: undefined, action: 'add' }),
                      'aria-label': 'Add tab'
                    },
                    '+'
                  )
                : null
            ]
          )
        ]
      )

      // Render tab content
      const tabContent = h(
        'div',
        {
          class: tabContentBaseClasses,
          onTouchstart: handleContentTouchStart,
          onTouchend: (event: TouchEvent) => handleContentTouchEnd(event, enabledTabKeys),
          onTouchcancel: () => {
            swipeStart.value = null
          }
        },
        tabPanes
      )

      return h(
        'div',
        { class: containerClasses.value, style: props.style },
        props.tabPosition === 'bottom' ? [tabContent, tabNavContent] : [tabNavContent, tabContent]
      )
    }
  }
})

export default Tabs

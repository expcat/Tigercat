import {
  defineComponent,
  computed,
  ref,
  provide,
  PropType,
  h,
  Fragment,
  getCurrentInstance,
  type VNode,
  type Component
} from 'vue'
import {
  classNames,
  getTabsContainerClasses,
  getTabNavClasses,
  getTabNavListClasses,
  tabAddButtonClasses,
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
  className?: string
  style?: Record<string, string | number>
}

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
      emit('edit', { targetKey: key, action: 'remove' })
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
      get activeKey() { return currentActiveKey.value },
      get type() { return props.type },
      get size() { return props.size },
      get tabPosition() { return props.tabPosition },
      get closable() { return props.closable },
      get destroyInactiveTabPane() { return props.destroyInactiveTabPane },
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
      let firstTabKey: string | number | undefined

      // First pass: collect valid TabPane children and determine firstTabKey
      type ChildInfo = { type: string | Component; props: Record<string, unknown>; children: unknown }
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

      // Compute resolvedActiveKey once for roving tabindex
      const resolvedActiveKey = currentActiveKey.value ?? firstTabKey

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
          h('div', { class: tabNavListClasses.value }, [
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
          ])
        ]
      )

      // Render tab content
      const tabContent = h('div', { class: tabContentBaseClasses }, tabPanes)

      return h(
        'div',
        { class: containerClasses.value, style: props.style },
        props.tabPosition === 'bottom'
          ? [tabContent, tabNavContent]
          : [tabNavContent, tabContent]
      )
    }
  }
})

export default Tabs

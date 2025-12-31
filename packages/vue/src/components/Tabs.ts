import { defineComponent, computed, ref, provide, PropType, h, reactive, watch } from 'vue'
import {
  classNames,
  getTabsContainerClasses,
  getTabNavClasses,
  getTabNavListClasses,
  tabContentBaseClasses,
  type TabType,
  type TabPosition,
  type TabSize,
} from '@tigercat/core'

// Tabs context key
export const TabsContextKey = Symbol('TabsContext')

// Tabs context interface
export interface TabsContext {
  activeKey: string | number | undefined
  type: TabType
  size: TabSize
  closable: boolean
  destroyInactiveTabPane: boolean
  handleTabClick: (key: string | number) => void
  handleTabClose: (key: string | number, event: Event) => void
}

export const Tabs = defineComponent({
  name: 'TigerTabs',
  props: {
    /**
     * Currently active tab key
     */
    activeKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    /**
     * Default active tab key (for uncontrolled mode)
     */
    defaultActiveKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    /**
     * Tab type - line, card, or editable-card
     * @default 'line'
     */
    type: {
      type: String as PropType<TabType>,
      default: 'line' as TabType,
    },
    /**
     * Tab position - top, bottom, left, or right
     * @default 'top'
     */
    tabPosition: {
      type: String as PropType<TabPosition>,
      default: 'top' as TabPosition,
    },
    /**
     * Tab size - small, medium, or large
     * @default 'medium'
     */
    size: {
      type: String as PropType<TabSize>,
      default: 'medium' as TabSize,
    },
    /**
     * Whether tabs can be closed (only works with editable-card type)
     * @default false
     */
    closable: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether tabs are centered
     * @default false
     */
    centered: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to destroy inactive tab panes
     * @default false
     */
    destroyInactiveTabPane: {
      type: Boolean,
      default: false,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },
  },
  emits: ['update:activeKey', 'change', 'edit', 'tab-click'],
  setup(props, { slots, emit }) {
    // Internal state for uncontrolled mode
    const internalActiveKey = ref<string | number | undefined>(props.defaultActiveKey)

    // Computed active key (controlled or uncontrolled)
    const currentActiveKey = computed(() => {
      return props.activeKey !== undefined ? props.activeKey : internalActiveKey.value
    })

    // Handle tab click
    const handleTabClick = (key: string | number) => {
      // Update internal state if uncontrolled
      if (props.activeKey === undefined) {
        internalActiveKey.value = key
      }

      // Emit events
      emit('update:activeKey', key)
      emit('change', key)
      emit('tab-click', key)
    }

    // Handle tab close
    const handleTabClose = (key: string | number, event: Event) => {
      event.stopPropagation()

      // Emit edit event
      emit('edit', { targetKey: key, action: 'remove' })
    }

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getTabsContainerClasses(props.tabPosition),
        props.className
      )
    })

    // Tab nav classes
    const tabNavClasses = computed(() => {
      return getTabNavClasses(props.tabPosition, props.type)
    })

    // Tab nav list classes
    const tabNavListClasses = computed(() => {
      return getTabNavListClasses(props.tabPosition, props.centered)
    })

    // Tab content classes
    const tabContentClasses = computed(() => {
      return tabContentBaseClasses
    })

    // Provide tabs context to child components (make it reactive)
    const tabsContextValue = reactive<TabsContext>({
      activeKey: currentActiveKey.value,
      type: props.type,
      size: props.size,
      closable: props.closable,
      destroyInactiveTabPane: props.destroyInactiveTabPane,
      handleTabClick,
      handleTabClose,
    })

    // Watch for changes to activeKey and update context
    watch(currentActiveKey, (newKey) => {
      tabsContextValue.activeKey = newKey
    })

    provide<TabsContext>(TabsContextKey, tabsContextValue)

    return () => {
      const children = slots.default?.() || []
      
      // Extract tab items (for nav) and tab panes (for content)
      const tabItems: any[] = []
      const tabPanes: any[] = []
      
      children.forEach((child: any) => {
        if (child && child.type && child.type.name === 'TigerTabPane') {
          // Store both the tab item and pane components
          // Pass the original child for tab rendering
          tabItems.push(
            h(child.type, {
              ...child.props,
              renderMode: 'tab',
            })
          )
          // Pass the child with its children/slots for pane rendering
          tabPanes.push(
            h(child.type, {
              ...child.props,
              renderMode: 'pane',
            }, child.children)
          )
        }
      })

      // Render tab nav
      const tabNavContent = h(
        'div',
        {
          class: tabNavClasses.value,
          role: 'tablist',
        },
        [
          h(
            'div',
            {
              class: tabNavListClasses.value,
            },
            tabItems
          ),
        ]
      )

      // Render tab content
      const tabContent = h(
        'div',
        {
          class: tabContentClasses.value,
        },
        tabPanes
      )

      // For left/right position, we need different layout
      if (props.tabPosition === 'left' || props.tabPosition === 'right') {
        return h(
          'div',
          {
            class: containerClasses.value,
          },
          [tabNavContent, tabContent]
        )
      }

      // For top/bottom position
      return h(
        'div',
        {
          class: containerClasses.value,
        },
        props.tabPosition === 'bottom' ? [tabContent, tabNavContent] : [tabNavContent, tabContent]
      )
    }
  },
})

export default Tabs

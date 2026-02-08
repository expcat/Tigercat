import { defineComponent, computed, inject, PropType, h, type VNode } from 'vue'
import {
  classNames,
  getTabItemClasses,
  getTabPaneClasses,
  isKeyActive,
  tabCloseButtonClasses,
  closeIconViewBox,
  closeIconPathD
} from '@expcat/tigercat-core'
import { TabsContextKey, type TabsContext } from './Tabs'

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
    // Inject tabs context
    const tabsContext = inject<TabsContext>(TabsContextKey)

    if (!tabsContext) {
      throw new Error('TabPane must be used within a Tabs component')
    }

    // Check if this tab is active
    const isActive = computed(() => {
      return isKeyActive(props.tabKey, tabsContext.activeKey)
    })

    // Check if tab is closable
    const isClosable = computed(() => {
      return props.closable !== undefined
        ? props.closable
        : tabsContext.closable && tabsContext.type === 'editable-card'
    })

    // Tab item classes
    const tabItemClasses = computed(() => {
      return getTabItemClasses(isActive.value, props.disabled, tabsContext.type, tabsContext.size)
    })

    // Tab pane classes
    const tabPaneClasses = computed(() => {
      return classNames(getTabPaneClasses(isActive.value), props.className)
    })

    // Handle tab click
    const handleClick = () => {
      if (!props.disabled) {
        tabsContext.handleTabClick(props.tabKey)
      }
    }

    // Handle close click
    const handleClose = (event: Event) => {
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

      const tabButtons = Array.from(
        tabList?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []
      )

      const enabled = tabButtons.filter((b) => !b.disabled)
      const currentIndex = enabled.findIndex((b) => b.id === props.tabId)
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
      // Render tab item (in the tab nav)
      if (props.renderMode === 'tab') {
        return h(
          'button',
          {
            type: 'button',
            class: tabItemClasses.value,
            role: 'tab',
            id: props.tabId,
            'aria-controls': props.panelId,
            'aria-selected': isActive.value,
            'aria-disabled': props.disabled,
            disabled: props.disabled,
            tabindex: typeof props.tabIndex === 'number' ? props.tabIndex : isActive.value ? 0 : -1,
            'data-tiger-tabs-id': tabsContext.idBase,
            'data-tiger-tab-key':
              typeof props.tabKey === 'number' ? `n:${props.tabKey}` : `s:${props.tabKey}`,
            onClick: handleClick,
            onKeydown: handleKeydown
          },
          [
            // Icon
            props.icon && h('span', { class: 'flex items-center' }, props.icon),
            // Label
            h('span', props.label),
            // Close button
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

      // Render tab pane content
      const shouldRender = isActive.value || !tabsContext.destroyInactiveTabPane
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

export default TabPane

import { defineComponent, computed, inject, PropType, h } from 'vue'
import {
  classNames,
  getTabItemClasses,
  getTabPaneClasses,
  isKeyActive,
} from '@tigercat/core'
import { TabsContextKey, type TabsContext } from './Tabs'

export const TabPane = defineComponent({
  name: 'TigerTabPane',
  props: {
    /**
     * Unique key for the tab pane (required)
     */
    tabKey: {
      type: [String, Number] as PropType<string | number>,
      required: true,
    },
    /**
     * Tab label/title
     */
    label: {
      type: String,
      required: true,
    },
    /**
     * Whether the tab is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the tab can be closed (overrides parent closable)
     */
    closable: {
      type: Boolean,
      default: undefined,
    },
    /**
     * Icon for the tab
     */
    icon: {
      type: [String, Object] as PropType<unknown>,
      default: undefined,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },
    /**
     * Render mode - 'tab' for tab item, 'pane' for content pane
     * @internal
     */
    renderMode: {
      type: String as PropType<'tab' | 'pane'>,
      default: 'pane',
    },
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
      return classNames(
        getTabItemClasses(
          isActive.value,
          props.disabled,
          tabsContext.type,
          tabsContext.size
        )
      )
    })

    // Tab pane classes
    const tabPaneClasses = computed(() => {
      return classNames(
        getTabPaneClasses(isActive.value),
        props.className
      )
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

    return () => {
      // Render tab item (in the tab nav)
      if (props.renderMode === 'tab') {
        return h(
          'div',
          {
            class: tabItemClasses.value,
            role: 'tab',
            'aria-selected': isActive.value,
            'aria-disabled': props.disabled,
            onClick: handleClick,
          },
          [
            // Icon
            props.icon && h('span', { class: 'flex items-center' }, props.icon),
            // Label
            h('span', props.label),
            // Close button
            isClosable.value &&
              h(
                'span',
                {
                  class: 'ml-2 p-0.5 rounded hover:bg-gray-200 transition-colors duration-150',
                  onClick: handleClose,
                },
                h(
                  'svg',
                  {
                    class: 'w-4 h-4',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24',
                  },
                  h('path', {
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': '2',
                    d: 'M6 18L18 6M6 6l12 12',
                  })
                )
              ),
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
          role: 'tabpanel',
          'aria-hidden': !isActive.value,
        },
        slots.default?.()
      )
    }
  },
})

export default TabPane

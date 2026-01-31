import { defineComponent, computed, inject, PropType, h } from 'vue'
import {
  classNames,
  getCollapsePanelClasses,
  getCollapsePanelHeaderClasses,
  getCollapseIconClasses,
  collapseHeaderTextClasses,
  collapsePanelContentWrapperClasses,
  collapsePanelContentBaseClasses,
  isPanelActive,
  coerceClassValue
} from '@expcat/tigercat-core'
import { CollapseContextKey, type CollapseContext } from './Collapse'

export interface VueCollapsePanelProps {
  panelKey: string | number
  header?: string
  disabled?: boolean
  showArrow?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const CollapsePanel = defineComponent({
  name: 'TigerCollapsePanel',
  props: {
    /**
     * Unique key for the panel (required)
     */
    panelKey: {
      type: [String, Number] as PropType<string | number>,
      required: true
    },
    /**
     * Panel header/title
     */
    header: {
      type: String,
      default: undefined
    },
    /**
     * Whether the panel is disabled
     * @default false
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Whether to show arrow icon
     * @default true
     */
    showArrow: {
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
  setup(props, { slots, attrs }) {
    // Inject collapse context
    const collapseContext = inject<CollapseContext>(CollapseContextKey)

    if (!collapseContext) {
      throw new Error('CollapsePanel must be used within a Collapse component')
    }

    // Check if this panel is active
    const isActive = computed(() => {
      return isPanelActive(props.panelKey, collapseContext.activeKeys)
    })

    // Panel classes
    const panelClasses = computed(() => {
      return classNames(
        getCollapsePanelClasses(collapseContext.ghost, props.className),
        coerceClassValue(attrs.class)
      )
    })

    // Header classes
    const headerClasses = computed(() => {
      return getCollapsePanelHeaderClasses(isActive.value, props.disabled)
    })

    // Icon classes
    const iconClasses = computed(() => {
      return getCollapseIconClasses(isActive.value, collapseContext.expandIconPosition)
    })

    // Handle header click
    const handleClick = () => {
      if (!props.disabled) {
        collapseContext.handlePanelClick(props.panelKey)
      }
    }

    // Handle keyboard navigation
    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled) {
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        collapseContext.handlePanelClick(props.panelKey)
      }
    }

    return () => {
      const headerSlot = slots.header?.()
      const extraSlot = slots.extra?.()

      // Arrow icon SVG
      const arrowIcon = h(
        'svg',
        {
          class: iconClasses.value,
          width: '16',
          height: '16',
          viewBox: '0 0 16 16',
          fill: 'none',
          xmlns: 'http://www.w3.org/2000/svg'
        },
        h('path', {
          d: 'M6 12L10 8L6 4',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })
      )

      // Header content
      const headerContent = []

      // Add arrow icon at start if enabled
      if (props.showArrow && collapseContext.expandIconPosition === 'start') {
        headerContent.push(arrowIcon)
      }

      // Add header text or slot
      headerContent.push(
        h(
          'span',
          {
            class: collapseHeaderTextClasses
          },
          headerSlot || props.header
        )
      )

      // Add extra slot if provided
      if (extraSlot) {
        headerContent.push(h('span', { class: 'ml-auto' }, extraSlot))
      }

      // Add arrow icon at end if enabled
      if (props.showArrow && collapseContext.expandIconPosition === 'end') {
        headerContent.push(arrowIcon)
      }

      // Panel header
      const header = h(
        'div',
        {
          class: headerClasses.value,
          role: 'button',
          tabindex: props.disabled ? -1 : 0,
          'aria-expanded': isActive.value,
          'aria-disabled': props.disabled,
          onClick: handleClick,
          onKeydown: handleKeydown
        },
        headerContent
      )

      // Panel content with animation wrapper
      const content = h(
        'div',
        {
          class: collapsePanelContentWrapperClasses,
          style: {
            maxHeight: isActive.value ? 'none' : '0',
            opacity: isActive.value ? '1' : '0'
          }
        },
        [
          h(
            'div',
            {
              class: collapsePanelContentBaseClasses
            },
            slots.default?.()
          )
        ]
      )

      // Complete panel
      return h(
        'div',
        {
          class: panelClasses.value,
          style: props.style
        },
        [header, content]
      )
    }
  }
})

export default CollapsePanel

import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  PropType
} from 'vue'
import {
  classNames,
  coerceClassValue,
  collapseExtraClasses,
  collapseHeaderRowClasses,
  collapseHeaderTextClasses,
  collapseKeyOf,
  collapsePanelContentBaseClasses,
  collapsePanelContentWrapperClasses,
  createAriaIdScope,
  createCollapseTransitionController,
  getCollapseIconClasses,
  getCollapsePanelClasses,
  getCollapsePanelHeaderClasses,
  isPanelActive
} from '@expcat/tigercat-core'
import { CollapseContextKey, type CollapseContext } from './Collapse'

export interface VueCollapsePanelProps {
  panelKey: string | number
  header?: string
  extra?: unknown
  disabled?: boolean
  showArrow?: boolean
  className?: string
  style?: Record<string, string | number>
}

export type CollapsePanelProps = VueCollapsePanelProps

export const CollapsePanel = defineComponent({
  name: 'TigerCollapsePanel',
  inheritAttrs: false,
  props: {
    /**
     * Unique key for the panel (required). `1` and `"1"` match.
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
    extra: {
      type: [String, Object, Number] as PropType<unknown>,
      default: undefined
    },
    /**
     * Disabled headers stay in the tab order and expose `aria-disabled`.
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
    const collapseContext = inject<CollapseContext>(CollapseContextKey)

    if (!collapseContext) {
      throw new Error('CollapsePanel must be used within a Collapse component')
    }

    const isActive = computed(() => {
      return isPanelActive(props.panelKey, collapseContext.activeKeys)
    })

    const contentRef = ref<HTMLElement>()
    const headerRef = ref<HTMLButtonElement>()
    const controllerReady = ref(false)
    const initialActive = isActive.value
    const ariaIds = createAriaIdScope()
    const headerId = ariaIds.next({ prefix: 'tiger-collapse-header' })
    const contentId = ariaIds.next({ prefix: 'tiger-collapse-content' })
    let transitionController: ReturnType<typeof createCollapseTransitionController> | undefined

    const panelClasses = computed(() => {
      return classNames(
        getCollapsePanelClasses(collapseContext.ghost, props.className),
        coerceClassValue(attrs.class)
      )
    })

    const headerClasses = computed(() => {
      return getCollapsePanelHeaderClasses(isActive.value, props.disabled)
    })

    const iconClasses = computed(() => {
      return getCollapseIconClasses(isActive.value, collapseContext.expandIconPosition)
    })

    const handleClick = () => {
      if (!props.disabled) {
        collapseContext.handlePanelClick(props.panelKey)
      }
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
        }
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        collapseContext.handlePanelClick(props.panelKey)
        return
      }

      const action =
        event.key === 'ArrowDown'
          ? 'next'
          : event.key === 'ArrowUp'
            ? 'prev'
            : event.key === 'Home'
              ? 'first'
              : event.key === 'End'
                ? 'last'
                : null

      if (!action) return
      event.preventDefault()
      collapseContext.moveHeaderFocus(event.currentTarget as HTMLButtonElement, action)
    }

    watch(isActive, (expanded, wasExpanded) => {
      if (wasExpanded && !expanded && contentRef.value?.contains(document.activeElement)) {
        headerRef.value?.focus()
      }
    })

    return () => {
      const headerSlot = slots.header?.()
      const extraSlot = slots.extra?.()
      const extraContent = extraSlot && extraSlot.length ? extraSlot : props.extra

      const arrowIcon = h(
        'svg',
        {
          class: iconClasses.value,
          width: '16',
          height: '16',
          viewBox: '0 0 16 16',
          fill: 'none',
          xmlns: 'http://www.w3.org/2000/svg',
          'aria-hidden': 'true'
        },
        h('path', {
          d: 'M4 6L8 10L12 6',
          stroke: 'currentColor',
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round'
        })
      )

      const headerContent = []

      if (props.showArrow && collapseContext.expandIconPosition === 'start') {
        headerContent.push(arrowIcon)
      }

      headerContent.push(
        h(
          'span',
          {
            class: collapseHeaderTextClasses
          },
          headerSlot || props.header
        )
      )

      if (props.showArrow && collapseContext.expandIconPosition === 'end') {
        headerContent.push(arrowIcon)
      }

      const headerButton = h(
        'button',
        {
          ref: headerRef,
          type: 'button',
          id: headerId,
          'data-tiger-collapse-header': '',
          class: headerClasses.value,
          'aria-expanded': isActive.value,
          'aria-controls': contentId,
          'aria-disabled': props.disabled || undefined,
          onClick: handleClick,
          onKeydown: handleKeydown
        },
        headerContent
      )

      const hasExtra = Array.isArray(extraContent)
        ? extraContent.length > 0
        : extraContent != null && extraContent !== ''
      const extraNode = hasExtra
        ? h('span', { class: collapseExtraClasses }, extraContent as never)
        : null

      const content = isActive.value
        ? h(
            'div',
            {
              ref: contentRef,
              id: contentId,
              'data-tiger-collapse-content': '',
              class: collapsePanelContentWrapperClasses,
              role: 'region',
              'aria-labelledby': headerId
            },
            [h('div', { class: collapsePanelContentBaseClasses }, slots.default?.())]
          )
        : null

      const Heading = `h${collapseContext.headingLevel}` as 'h3'
      return h(
        'div',
        {
          class: panelClasses.value,
          style: props.style
        },
        [
          h('div', { class: collapseHeaderRowClasses }, [
            h(Heading, { class: 'm-0 min-w-0 flex-1 font-[inherit]' }, [headerButton]),
            extraNode
          ]),
          content
        ]
      )
    }
  }
})

export default CollapsePanel

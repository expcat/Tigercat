import {
  defineComponent,
  computed,
  ref,
  provide,
  inject,
  PropType,
  h,
  useId,
  watch,
  onMounted,
  onBeforeUnmount,
  type VNode,
  type Component
} from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  closeIconPathD,
  closeIconViewBox,
  getTabsContainerClasses,
  getTabItemClasses,
  getTabNavClasses,
  getTabNavListClasses,
  getTabPaneClasses,
  getTabIndicatorClasses,
  getTabIndicatorStyleFromBox,
  getTabContentClasses,
  getTabAddButtonClasses,
  tabCloseButtonClasses,
  getGestureTouchPoint,
  resolveSwipeGesture,
  isKeyActive,
  getNextActiveKey,
  getAdjacentEnabledKey,
  getTabKeyboardDelta,
  getTabSwipeDelta,
  isSwipeBlockedByNestedScroll,
  measureTabIndicatorBox,
  formatTabKey,
  parseTabKey,
  resolveDisplayedActiveKey,
  isTabPaneType,
  isTabPaneChildProps,
  readTabPaneKey,
  pickTablistNamingAttrs,
  mergeTigerLocale,
  getTabsLabels,
  getLocaleDirection,
  type TabRecord,
  type TabIndicatorStyle,
  type TigerLocale,
  type TigerLocaleTabs,
  type TabType,
  type TabPosition,
  type TabSize
} from '@expcat/tigercat-core'
import { flattenElementVNodes } from '../utils/flatten-vnodes'
import { useTigerConfig } from './ConfigProvider'

export const TabsContextKey = Symbol('TabsContext')

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
  labels: Required<TigerLocaleTabs>
  handleTabClick: (key: string | number) => void
  handleTabClose: (key: string | number, event: Event) => void
}

export function useTabsContext(): TabsContext | undefined {
  return inject<TabsContext>(TabsContextKey)
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
  lazy?: boolean
  swipeable?: boolean
  className?: string
  style?: Record<string, string | number>
}

export type TabsProps = VueTabsProps

export interface VueTabPaneProps {
  tabKey: string | number
  label: string
  disabled?: boolean
  closable?: boolean
  icon?: string | VNode
  className?: string
  style?: Record<string, string | number>
}

export type TabPaneProps = VueTabPaneProps

function isTabPaneVNode(child: VNode, tabPane: unknown): boolean {
  return (
    isTabPaneType(child.type, tabPane) ||
    isTabPaneChildProps((child.props ?? {}) as Record<string, unknown>)
  )
}

export const TabPane = defineComponent({
  name: 'TigerTabPane',
  inheritAttrs: false,
  props: {
    tabKey: {
      type: [String, Number] as PropType<string | number>,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    closable: {
      type: Boolean,
      default: undefined
    },
    icon: {
      type: [String, Object] as PropType<string | VNode>,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    renderMode: {
      type: String as PropType<'tab' | 'pane'>,
      default: 'pane'
    },
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
  setup(props, { slots, attrs }) {
    const tabsContext = inject<TabsContext>(TabsContextKey)

    if (!tabsContext) {
      throw new Error('TabPane must be used within a Tabs component')
    }

    const isActive = computed(() => isKeyActive(props.tabKey, tabsContext.activeKey))
    const hasBeenActivated = ref(isActive.value)
    watch(isActive, (val) => {
      if (val) hasBeenActivated.value = true
    })

    const isClosable = computed(() =>
      props.closable !== undefined
        ? props.closable
        : tabsContext.closable && tabsContext.type === 'editable-card'
    )

    const panelMounted = computed(() =>
      tabsContext.lazy
        ? hasBeenActivated.value && (isActive.value || !tabsContext.destroyInactiveTabPane)
        : isActive.value || !tabsContext.destroyInactiveTabPane
    )

    const handleClick = () => {
      if (!props.disabled) tabsContext.handleTabClick(props.tabKey)
    }

    const handleClose = (event: Event) => {
      event.stopPropagation()
      if (!props.disabled) tabsContext.handleTabClose(props.tabKey, event)
    }

    const handleKeydown = (event: KeyboardEvent) => {
      if (props.disabled) return

      if (isClosable.value && (event.key === 'Backspace' || event.key === 'Delete')) {
        event.preventDefault()
        tabsContext.handleTabClose(props.tabKey, event)
        return
      }

      const tabList = (event.currentTarget as HTMLElement | null)?.closest('[role="tablist"]')
      const dir =
        tabList instanceof HTMLElement && getComputedStyle(tabList).direction === 'rtl'
          ? 'rtl'
          : 'ltr'
      const delta = getTabKeyboardDelta(event.key, tabsContext.tabPosition, dir)

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        tabsContext.handleTabClick(props.tabKey)
        return
      }

      if (delta == null) return
      event.preventDefault()

      const tabButtons = Array.from(tabList?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])
      const records: TabRecord[] = tabButtons.map((button) => ({
        key: parseTabKey(button.getAttribute('data-tiger-tab-key')) ?? button.id,
        disabled: button.getAttribute('aria-disabled') === 'true'
      }))
      const enabled = records.filter((tab) => !tab.disabled)
      if (enabled.length === 0) return

      const nextKey =
        delta === 'home'
          ? enabled[0].key
          : delta === 'end'
            ? enabled[enabled.length - 1].key
            : getAdjacentEnabledKey(records, props.tabKey, delta)
      if (nextKey === undefined) return

      const nextButton = tabButtons.find((button) =>
        isKeyActive(parseTabKey(button.getAttribute('data-tiger-tab-key')) ?? button.id, nextKey)
      )
      nextButton?.focus()
      tabsContext.handleTabClick(nextKey)
    }

    return () => {
      if (props.renderMode === 'tab') {
        return h(
          'button',
          {
            type: 'button',
            class: getTabItemClasses(
              isActive.value,
              props.disabled,
              tabsContext.type,
              tabsContext.size,
              tabsContext.tabPosition
            ),
            role: 'tab',
            id: props.tabId,
            'aria-controls': panelMounted.value ? props.panelId : undefined,
            'aria-selected': isActive.value,
            'aria-disabled': props.disabled || undefined,
            'aria-label': props.label,
            tabindex: props.disabled
              ? -1
              : typeof props.tabIndex === 'number'
                ? props.tabIndex
                : isActive.value
                  ? 0
                  : -1,
            'data-tiger-tabs-id': tabsContext.idBase,
            'data-tiger-tab-key': formatTabKey(props.tabKey),
            onClick: handleClick,
            onKeydown: handleKeydown
          },
          [
            props.icon && h('span', { class: 'flex items-center' }, props.icon),
            h('span', { 'aria-hidden': 'true' }, props.label),
            isClosable.value &&
              h(
                'span',
                {
                  class: tabCloseButtonClasses,
                  'aria-hidden': 'true',
                  onClick: handleClose
                },
                h(
                  'svg',
                  {
                    class: 'w-4 h-4',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: closeIconViewBox,
                    'aria-hidden': 'true'
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

      if (!panelMounted.value) return null

      return h(
        'div',
        {
          class: classNames(
            getTabPaneClasses(isActive.value),
            props.className,
            coerceClassValue(attrs.class)
          ),
          style: mergeStyleValues(attrs.style, props.style),
          role: 'tabpanel',
          id: props.panelId,
          'aria-labelledby': props.tabId,
          'aria-hidden': !isActive.value,
          inert: isActive.value ? undefined : true
        },
        slots.default?.()
      )
    }
  }
})

export const Tabs = defineComponent({
  name: 'TigerTabs',
  inheritAttrs: false,
  props: {
    activeKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    defaultActiveKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    type: {
      type: String as PropType<TabType>,
      default: 'line' as TabType
    },
    tabPosition: {
      type: String as PropType<TabPosition>,
      default: 'top' as TabPosition
    },
    size: {
      type: String as PropType<TabSize>,
      default: 'medium' as TabSize
    },
    closable: {
      type: Boolean,
      default: false
    },
    centered: {
      type: Boolean,
      default: false
    },
    destroyInactiveTabPane: {
      type: Boolean,
      default: false
    },
    lazy: {
      type: Boolean,
      default: false
    },
    swipeable: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleTabs>>,
      default: undefined
    }
  },
  emits: ['update:activeKey', 'change', 'edit', 'tab-click'],
  setup(props, { slots, emit, attrs }) {
    const config = useTigerConfig()
    const idBase = `tiger-tabs-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getTabsLabels(mergedLocale.value, props.labels))
    const dir = computed(() => getLocaleDirection(mergedLocale.value))

    const internalActiveKey = ref<string | number | undefined>(props.defaultActiveKey)
    const swipeStart = ref<ReturnType<typeof getGestureTouchPoint> | null>(null)
    const tabListEl = ref<HTMLElement | null>(null)
    const indicatorBox = ref<TabIndicatorStyle>({ opacity: '0' })
    let lastTabRecords: TabRecord[] = []
    let resizeObserver: ResizeObserver | null = null

    const currentActiveKey = computed(() =>
      props.activeKey !== undefined ? props.activeKey : internalActiveKey.value
    )

    const handleTabClick = (key: string | number) => {
      emit('tab-click', key)
      if (isKeyActive(key, currentActiveKey.value)) return
      if (props.activeKey === undefined) internalActiveKey.value = key
      emit('update:activeKey', key)
      emit('change', key)
    }

    const handleTabClose = (key: string | number, event: Event) => {
      event.stopPropagation()
      if (props.activeKey === undefined && isKeyActive(key, currentActiveKey.value)) {
        internalActiveKey.value = getNextActiveKey(key, currentActiveKey.value, lastTabRecords)
      }
      emit('edit', { targetKey: key, action: 'remove' })
    }

    const updateIndicator = () => {
      const list = tabListEl.value
      if (!list || props.type !== 'line') {
        indicatorBox.value = { opacity: '0' }
        return
      }
      const tab = list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')
      const computedDir = getComputedStyle(list).direction === 'rtl' ? 'rtl' : dir.value
      indicatorBox.value = getTabIndicatorStyleFromBox(
        measureTabIndicatorBox(list, tab, props.tabPosition, computedDir),
        props.tabPosition
      )
    }

    const bindIndicatorObserver = () => {
      resizeObserver?.disconnect()
      const list = tabListEl.value
      if (!list || typeof ResizeObserver === 'undefined') return
      resizeObserver = new ResizeObserver(updateIndicator)
      resizeObserver.observe(list)
      Array.from(list.querySelectorAll('[role="tab"]')).forEach((node) =>
        resizeObserver?.observe(node)
      )
      updateIndicator()
    }

    onMounted(bindIndicatorObserver)
    onBeforeUnmount(() => resizeObserver?.disconnect())
    watch(
      () => [currentActiveKey.value, props.tabPosition, props.type, dir.value],
      () => {
        bindIndicatorObserver()
      }
    )

    const handleContentTouchStart = (event: TouchEvent) => {
      if (!props.swipeable || event.touches.length !== 1) return
      swipeStart.value = getGestureTouchPoint(event.touches, event.timeStamp)
    }

    const handleContentTouchEnd = (event: TouchEvent) => {
      if (!props.swipeable || !swipeStart.value || event.changedTouches.length !== 1) return
      if (isSwipeBlockedByNestedScroll(event.target, event.currentTarget)) {
        swipeStart.value = null
        return
      }
      const endPoint = getGestureTouchPoint(event.changedTouches, event.timeStamp)
      const swipe = resolveSwipeGesture(swipeStart.value, endPoint, {
        minDistance: 48,
        maxCrossAxisRatio: 0.75
      })
      swipeStart.value = null
      if (!swipe) return
      const computedDir =
        tabListEl.value && getComputedStyle(tabListEl.value).direction === 'rtl' ? 'rtl' : dir.value
      const delta = getTabSwipeDelta(swipe.direction, props.tabPosition, computedDir)
      if (delta == null) return
      const nextKey = getAdjacentEnabledKey(lastTabRecords, currentActiveKey.value, delta)
      if (nextKey !== undefined) handleTabClick(nextKey)
    }

    provide<TabsContext>(TabsContextKey, {
      get activeKey() {
        return resolveDisplayedActiveKey(currentActiveKey.value, lastTabRecords)
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
      get labels() {
        return labels.value
      },
      handleTabClick,
      handleTabClose
    })

    return () => {
      const children = flattenElementVNodes(slots.default?.() as VNode[] | undefined)
      const validChildren: Array<{
        type: string | Component
        props: Record<string, unknown>
        children: unknown
        key: string | number
      }> = []
      const tabRecords: TabRecord[] = []

      for (const child of children) {
        if (!isTabPaneVNode(child, TabPane)) continue
        const childProps = (child.props ?? {}) as Record<string, unknown>
        const key = readTabPaneKey(childProps)
        if (key === undefined) continue
        const paneClosable =
          childProps.closable === true || childProps.closable === ''
            ? true
            : childProps.closable === false
              ? false
              : props.closable && props.type === 'editable-card'
        tabRecords.push({
          key,
          disabled: childProps.disabled === true || childProps.disabled === '',
          closable: paneClosable,
          label: typeof childProps.label === 'string' ? childProps.label : undefined
        })
        const paneType =
          typeof child.type === 'string' || typeof child.type === 'object'
            ? (child.type as string | Component)
            : 'div'
        validChildren.push({
          type: paneType,
          props: childProps,
          children: child.children,
          key
        })
      }

      lastTabRecords = tabRecords
      const displayedKey = resolveDisplayedActiveKey(currentActiveKey.value, tabRecords)
      const tabItems: VNode[] = []
      const tabPanes: VNode[] = []

      for (const child of validChildren) {
        const tabId = `${idBase}-tab-${String(child.key)}`
        const panelId = `${idBase}-panel-${String(child.key)}`
        tabItems.push(
          h(child.type, {
            ...child.props,
            key: `tab-${String(child.key)}`,
            renderMode: 'tab',
            tabId,
            panelId,
            tabIndex: isKeyActive(child.key, displayedKey) ? 0 : -1
          })
        )
        tabPanes.push(
          h(
            child.type,
            {
              ...child.props,
              key: `pane-${String(child.key)}`,
              renderMode: 'pane',
              tabId,
              panelId
            },
            child.children as VNode[] | undefined
          )
        )
      }

      const naming = pickTablistNamingAttrs(attrs as Record<string, unknown>)
      const tabNavContent = h('div', { class: getTabNavClasses(props.tabPosition, props.type) }, [
        h(
          'div',
          {
            ref: (el) => {
              tabListEl.value = el as HTMLElement | null
            },
            class: getTabNavListClasses(props.tabPosition, props.centered),
            role: 'tablist',
            dir: dir.value,
            'aria-label':
              naming['aria-label'] ??
              (naming['aria-labelledby'] ? undefined : labels.value.tablistAriaLabel),
            'aria-labelledby': naming['aria-labelledby'],
            id: naming.id,
            'aria-orientation':
              props.tabPosition === 'left' || props.tabPosition === 'right'
                ? 'vertical'
                : 'horizontal'
          },
          [
            props.type === 'line'
              ? h('div', {
                  'data-tiger-tabs-indicator': 'true',
                  'aria-hidden': 'true',
                  class: getTabIndicatorClasses(props.type, props.tabPosition),
                  style: indicatorBox.value
                })
              : null,
            ...tabItems
          ]
        ),
        ...tabRecords
          .filter((tab) => tab.closable && !tab.disabled)
          .map((tab) =>
            h(
              'button',
              {
                key: `close-${String(tab.key)}`,
                type: 'button',
                class: 'sr-only',
                'aria-label': labels.value.closeTabAriaLabel.replace(
                  '{label}',
                  String(tab.label ?? tab.key)
                ),
                onClick: (event: Event) => handleTabClose(tab.key, event)
              },
              labels.value.closeTabAriaLabel.replace('{label}', String(tab.label ?? tab.key))
            )
          ),
        props.type === 'editable-card'
          ? h(
              'button',
              {
                type: 'button',
                class: getTabAddButtonClasses(props.tabPosition),
                onClick: () => emit('edit', { targetKey: undefined, action: 'add' }),
                'aria-label': labels.value.addTabAriaLabel
              },
              '+'
            )
          : null
      ])

      const tabContent = h(
        'div',
        {
          class: getTabContentClasses(props.tabPosition),
          onTouchstart: handleContentTouchStart,
          onTouchend: handleContentTouchEnd,
          onTouchcancel: () => {
            swipeStart.value = null
          }
        },
        tabPanes
      )

      return h(
        'div',
        {
          class: classNames(
            getTabsContainerClasses(props.tabPosition),
            props.className,
            coerceClassValue((attrs as { class?: unknown }).class)
          ),
          style: mergeStyleValues((attrs as { style?: unknown }).style, props.style)
        },
        props.tabPosition === 'bottom' ? [tabContent, tabNavContent] : [tabNavContent, tabContent]
      )
    }
  }
})

export default Tabs

import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  watch
} from 'vue'
import type { VNode } from 'vue'
import {
  classNames,
  coerceClassValue,
  createScrollSpyObserver,
  createScrollSpyPayload,
  flattenScrollSpyItems,
  getInitialScrollSpyActiveKey,
  getScrollSpyItemClasses,
  getScrollSpyItemByKey,
  getScrollSpyKeyString,
  getScrollSpyListClasses,
  getScrollSpyRootClasses,
  mergeStyleValues,
  scrollSpyNestedListClasses,
  scrollToScrollSpyItem,
  type ScrollSpyChangePayload,
  type ScrollSpyDirection,
  type ScrollSpyItem,
  type ScrollSpyKey
} from '@expcat/tigercat-core'

const getWindowContainer = () => window

export const ScrollSpy = defineComponent({
  name: 'TigerScrollSpy',
  inheritAttrs: false,
  props: {
    items: {
      type: Array as PropType<ScrollSpyItem[]>,
      default: () => []
    },
    activeKey: {
      type: [String, Number] as PropType<ScrollSpyKey>,
      default: undefined
    },
    defaultActiveKey: {
      type: [String, Number] as PropType<ScrollSpyKey>,
      default: undefined
    },
    offsetTop: {
      type: Number,
      default: 0
    },
    targetOffset: {
      type: Number,
      default: undefined
    },
    bounds: {
      type: Number,
      default: 5
    },
    direction: {
      type: String as PropType<ScrollSpyDirection>,
      default: 'vertical'
    },
    sticky: {
      type: Boolean,
      default: false
    },
    ariaLabel: {
      type: String,
      default: 'Scroll navigation'
    },
    getContainer: {
      type: Function as PropType<() => HTMLElement | Window>,
      default: getWindowContainer
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  emits: ['update:activeKey', 'change', 'click'],
  setup(props, { attrs, emit }) {
    const innerActiveKey = ref<ScrollSpyKey | undefined>(
      getInitialScrollSpyActiveKey(props.items, props.activeKey, props.defaultActiveKey)
    )
    const isControlled = computed(() => props.activeKey !== undefined)
    const currentActiveKey = computed(() =>
      isControlled.value ? props.activeKey : innerActiveKey.value
    )
    const activeKeyString = computed(() =>
      currentActiveKey.value === undefined ? '' : getScrollSpyKeyString(currentActiveKey.value)
    )
    const flatItems = computed(() => flattenScrollSpyItems(props.items))
    let stopObserver: (() => void) | null = null

    const emitActive = (item: ScrollSpyItem, source: ScrollSpyChangePayload['source']) => {
      const nextKeyString = getScrollSpyKeyString(item.key)
      if (nextKeyString === activeKeyString.value) return

      const payload = createScrollSpyPayload(item, source)
      if (!isControlled.value) innerActiveKey.value = item.key
      emit('update:activeKey', item.key)
      emit('change', item.key, item, payload)
    }

    const setupObserver = () => {
      stopObserver?.()
      stopObserver = createScrollSpyObserver(props.items, {
        container: props.getContainer(),
        offsetTop: props.offsetTop,
        targetOffset: props.targetOffset,
        bounds: props.bounds,
        onChange: (item) => emitActive(item, 'scroll')
      })
    }

    const handleClick = (item: ScrollSpyItem, event: MouseEvent) => {
      event.preventDefault()
      if (item.disabled) return

      emit('click', item, event)
      emitActive(item, 'click')
      scrollToScrollSpyItem(item, props.getContainer(), props.targetOffset ?? props.offsetTop)
    }

    onMounted(() => {
      nextTick(() => setupObserver())
    })

    watch(
      () => [props.items, props.offsetTop, props.targetOffset, props.bounds, props.getContainer],
      () => nextTick(() => setupObserver())
    )

    watch(
      () => [props.items, props.defaultActiveKey],
      () => {
        if (isControlled.value) return
        const currentItem = getScrollSpyItemByKey(props.items, innerActiveKey.value)
        if (!currentItem || currentItem.disabled) {
          innerActiveKey.value = getInitialScrollSpyActiveKey(
            props.items,
            undefined,
            props.defaultActiveKey
          )
        }
      }
    )

    onBeforeUnmount(() => {
      stopObserver?.()
    })

    const renderItems = (items: ScrollSpyItem[], nested = false): VNode =>
      h(
        'ul',
        { class: nested ? scrollSpyNestedListClasses : getScrollSpyListClasses(props.direction) },
        items.map((item) => {
          const keyString = getScrollSpyKeyString(item.key)
          const isActive = keyString === activeKeyString.value
          const depth = flatItems.value.find((flat) => flat.key === item.key)?.depth ?? 0

          return h('li', { key: keyString, 'data-depth': depth }, [
            h(
              'a',
              {
                href: item.href,
                class: getScrollSpyItemClasses(isActive, item.disabled),
                'aria-current': isActive ? 'location' : undefined,
                'aria-disabled': item.disabled || undefined,
                'data-key': keyString,
                onClick: (event: MouseEvent) => handleClick(item, event)
              },
              item.label
            ),
            item.children?.length ? renderItems(item.children, true) : null
          ])
        })
      )

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      return h(
        'nav',
        {
          ...attrs,
          class: classNames(
            getScrollSpyRootClasses(props.sticky, props.className),
            coerceClassValue(attrsRecord.class)
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          'aria-label': props.ariaLabel
        },
        renderItems(props.items)
      )
    }
  }
})

export type VueScrollSpyProps = InstanceType<typeof ScrollSpy>['$props']

export default ScrollSpy

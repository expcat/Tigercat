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
  createProgrammaticScrollLock,
  createScrollSpyObserver,
  createScrollSpyPayload,
  flattenScrollSpyItems,
  getInitialScrollSpyActiveKey,
  getScrollSpyItemClasses,
  getScrollSpyItemByKey,
  getScrollSpyKeyString,
  getScrollSpyLabels,
  getScrollSpyListClasses,
  getScrollSpyRootClasses,
  getScrollSpyRootStyle,
  mergeStyleValues,
  mergeTigerLocale,
  resolveScrollSpyContainer,
  resolveScrollSpyOffset,
  shouldActivateScrollSpyClick,
  activateScrollSpyClick,
  type ScrollRootInput,
  type ScrollSpyChangePayload,
  type ScrollSpyDirection,
  type ScrollSpyItem,
  type ScrollSpyKey,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

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
      default: undefined
    },
    getContainer: {
      type: [String, Object, Function] as PropType<ScrollRootInput>,
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
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  emits: ['update:activeKey', 'change', 'click'],
  setup(props, { attrs, emit }) {
    const config = useTigerConfig()
    const labels = computed(() =>
      getScrollSpyLabels(mergeTigerLocale(config.value.locale, props.locale))
    )
    const offset = computed(() => resolveScrollSpyOffset(props.targetOffset, props.offsetTop))
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
    const scrollLock = createProgrammaticScrollLock(() =>
      resolveScrollSpyContainer(props.getContainer)
    )

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
        container: props.getContainer,
        offsetTop: offset.value,
        bounds: props.bounds,
        onChange: (item) => {
          if (scrollLock.isLocked()) return
          emitActive(item, 'scroll')
        }
      })
    }

    const handleClick = (item: ScrollSpyItem, event: MouseEvent) => {
      if (item.disabled) {
        event.preventDefault()
        return
      }
      if (!shouldActivateScrollSpyClick(item, event)) return

      event.preventDefault()
      emit('click', item, event)
      emitActive(item, 'click')
      scrollLock.lock()
      activateScrollSpyClick(item, resolveScrollSpyContainer(props.getContainer), offset.value)
    }

    onMounted(() => {
      nextTick(() => setupObserver())
    })

    watch(
      [
        () => props.items,
        offset,
        () => props.bounds,
        () => {
          const container = resolveScrollSpyContainer(props.getContainer)
          return container === window ? 'window' : container
        }
      ],
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
      scrollLock.dispose()
    })

    const renderItems = (items: ScrollSpyItem[], nested = false): VNode =>
      h(
        'ul',
        { class: getScrollSpyListClasses(props.direction, nested), role: 'list' },
        items.map((item) => {
          const keyString = getScrollSpyKeyString(item.key)
          const isActive = keyString === activeKeyString.value
          const depth =
            flatItems.value.find((flat) => getScrollSpyKeyString(flat.key) === keyString)?.depth ??
            0
          const hasHref = Boolean(item.href)
          const tag = hasHref ? 'a' : 'span'

          return h('li', { key: keyString, 'data-depth': depth }, [
            h(
              tag,
              {
                href: hasHref ? item.href : undefined,
                class: getScrollSpyItemClasses(isActive, item.disabled),
                'aria-current': isActive ? 'location' : undefined,
                'aria-disabled': item.disabled || undefined,
                tabindex: item.disabled ? -1 : undefined,
                'data-key': keyString,
                onClick: hasHref ? (event: MouseEvent) => handleClick(item, event) : undefined
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
          style: mergeStyleValues(
            getScrollSpyRootStyle(props.sticky, offset.value),
            attrsRecord.style,
            props.style
          ),
          'aria-label': props.ariaLabel ?? labels.value.ariaLabel
        },
        renderItems(props.items)
      )
    }
  }
})

export type VueScrollSpyProps = InstanceType<typeof ScrollSpy>['$props']
export type ScrollSpyProps = VueScrollSpyProps

export default ScrollSpy

import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
  type VNodeChild
} from 'vue'
import {
  captureActiveElement,
  classNames,
  coerceClassValue,
  focusFirst,
  getInitialPickerActiveIndex,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  getSpotlightOptionClasses,
  getSpotlightSearchState,
  getSpotlightShortcutLabel,
  mergeStyleValues,
  restoreFocus,
  shouldCloseOnMaskClick,
  spotlightEmptyClasses,
  spotlightGroupClasses,
  spotlightGroupLabelClasses,
  spotlightHeaderClasses,
  spotlightInputClasses,
  spotlightListClasses,
  spotlightMaskClasses,
  spotlightPanelClasses,
  spotlightRootClasses,
  spotlightTitleClasses,
  type SpotlightItem,
  type SpotlightItemFilter
} from '@expcat/tigercat-core'
import {
  renderVueBodyTeleport,
  useVueBodyScrollLock,
  useVueEscapeKey,
  useVueFocusTrap
} from '../utils/overlay'

let spotlightIdCounter = 0
const createSpotlightId = () => `tiger-spotlight-${++spotlightIdCounter}`

export type VueSpotlightProps = InstanceType<typeof Spotlight>['$props']

export const Spotlight = defineComponent({
  name: 'TigerSpotlight',
  inheritAttrs: false,
  props: {
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined
    },
    defaultOpen: {
      type: Boolean,
      default: false
    },
    query: {
      type: String as PropType<string | undefined>,
      default: undefined
    },
    defaultQuery: {
      type: String,
      default: ''
    },
    items: {
      type: Array as PropType<SpotlightItem[]>,
      default: () => []
    },
    title: {
      type: String,
      default: 'Spotlight'
    },
    placeholder: {
      type: String,
      default: 'Search'
    },
    emptyText: {
      type: String,
      default: 'No results found'
    },
    inputAriaLabel: {
      type: String,
      default: undefined
    },
    listboxLabel: {
      type: String,
      default: undefined
    },
    closeOnSelect: {
      type: Boolean,
      default: true
    },
    mask: {
      type: Boolean,
      default: true
    },
    maskClosable: {
      type: Boolean,
      default: true
    },
    zIndex: {
      type: Number,
      default: 1000
    },
    className: {
      type: String,
      default: undefined
    },
    defaultActiveFirstItem: {
      type: Boolean,
      default: true
    },
    filterItem: {
      type: Function as PropType<SpotlightItemFilter>,
      default: undefined
    },
    limit: {
      type: Number,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    },
    disableTeleport: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:open', 'open-change', 'close', 'update:query', 'query-change', 'select'],
  setup(props, { emit, attrs, slots }) {
    const uncontrolledOpen = ref(props.defaultOpen)
    const uncontrolledQuery = ref(props.defaultQuery)
    const activeIndex = ref(-1)
    const instanceId = createSpotlightId()
    const titleId = `${instanceId}-title`
    const listboxId = `${instanceId}-listbox`
    const dialogRef = ref<HTMLElement | null>(null)
    const inputRef = ref<HTMLInputElement | null>(null)
    const previousActiveElement = ref<HTMLElement | null>(null)

    const resolvedOpen = computed(() => props.open ?? uncontrolledOpen.value)
    const resolvedQuery = computed(() => props.query ?? uncontrolledQuery.value)
    const searchState = computed(() =>
      getSpotlightSearchState(props.items, resolvedQuery.value, {
        filterItem: props.filterItem,
        limit: props.limit
      })
    )

    const setOpenValue = (nextOpen: boolean) => {
      if (props.open === undefined) uncontrolledOpen.value = nextOpen
      emit('update:open', nextOpen)
      emit('open-change', nextOpen)
      if (!nextOpen) emit('close')
    }

    const setQueryValue = (nextQuery: string) => {
      if (props.query === undefined) uncontrolledQuery.value = nextQuery
      emit('update:query', nextQuery)
      emit('query-change', nextQuery)
    }

    const closeSpotlight = () => setOpenValue(false)

    const selectItem = (item: SpotlightItem) => {
      if (item.disabled) return
      emit('select', item)
      if (props.closeOnSelect) closeSpotlight()
    }

    const updateActiveIndex = () => {
      activeIndex.value = resolvedOpen.value
        ? getInitialPickerActiveIndex(
            searchState.value.flatResults,
            props.defaultActiveFirstItem,
            (result) => result.item.disabled === true
          )
        : -1
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Home':
        case 'End':
          event.preventDefault()
          activeIndex.value = getPickerNavigationIndex(
            searchState.value.flatResults,
            activeIndex.value,
            event.key,
            (result) => result.item.disabled === true
          )
          break
        case 'Enter': {
          event.preventDefault()
          const result = searchState.value.flatResults[activeIndex.value]
          if (result) selectItem(result.item)
          break
        }
        case 'Escape':
          event.preventDefault()
          closeSpotlight()
          break
      }
    }

    const handleMaskClick = (event: MouseEvent) => {
      if (shouldCloseOnMaskClick(event, props.maskClosable)) {
        closeSpotlight()
      }
    }

    useVueBodyScrollLock(resolvedOpen)
    useVueFocusTrap({ enabled: resolvedOpen, containerRef: dialogRef })
    let cleanupEscape: (() => void) | undefined

    onMounted(() => {
      cleanupEscape = useVueEscapeKey({ enabled: resolvedOpen, onEscape: closeSpotlight })
      if (resolvedOpen.value) {
        nextTick(() => focusFirst([inputRef.value, dialogRef.value]))
      }
    })

    onBeforeUnmount(() => cleanupEscape?.())

    watch([resolvedOpen, resolvedQuery, () => props.items], updateActiveIndex, { immediate: true })

    watch(
      resolvedOpen,
      async (isOpen) => {
        if (!isOpen) {
          restoreFocus(previousActiveElement.value)
          return
        }

        previousActiveElement.value = captureActiveElement()
        await nextTick()
        focusFirst([inputRef.value, dialogRef.value])
      },
      { flush: 'post' }
    )

    return () => {
      if (!resolvedOpen.value) return null

      const state = searchState.value
      const activeResult = state.flatResults[activeIndex.value]
      const activeOptionId = activeResult
        ? getPickerOptionId(listboxId, activeResult.flatIndex)
        : undefined

      const content = h(
        'div',
        {
          class: spotlightRootClasses,
          style: { zIndex: props.zIndex },
          'data-tiger-spotlight-root': ''
        },
        [
          props.mask
            ? h('div', {
                class: spotlightMaskClasses,
                'aria-hidden': 'true',
                onClick: handleMaskClick
              })
            : null,
          h(
            'div',
            {
              ...attrs,
              ref: dialogRef,
              id: instanceId,
              role: 'dialog',
              'aria-modal': 'true',
              'aria-labelledby': props.title ? titleId : undefined,
              tabindex: -1,
              class: classNames(
                spotlightPanelClasses,
                props.className,
                coerceClassValue(attrs.class)
              ),
              style: mergeStyleValues(
                props.style,
                attrs.style as Record<string, unknown> | string | undefined
              )
            },
            [
              h('div', { class: spotlightHeaderClasses }, [
                props.title
                  ? h('div', { id: titleId, class: spotlightTitleClasses }, props.title)
                  : null,
                h('input', {
                  ref: inputRef,
                  value: resolvedQuery.value,
                  type: 'search',
                  class: spotlightInputClasses,
                  placeholder: props.placeholder,
                  'aria-label': props.inputAriaLabel ?? props.placeholder,
                  autocomplete: 'off',
                  ...getPickerComboboxAria({
                    expanded: true,
                    listboxId,
                    activeOptionId
                  }),
                  onInput: (event: Event) =>
                    setQueryValue((event.target as HTMLInputElement).value),
                  onKeydown: handleKeyDown
                })
              ]),
              state.flatResults.length > 0
                ? h(
                    'div',
                    {
                      ...getPickerListboxAria({ id: listboxId, label: props.listboxLabel }),
                      class: spotlightListClasses
                    },
                    state.groups.map((group, groupIndex) =>
                      h(
                        'div',
                        {
                          key: group.label ?? `group-${groupIndex}`,
                          class: spotlightGroupClasses,
                          role: group.label ? 'group' : undefined,
                          'aria-label': group.label
                        },
                        [
                          group.label
                            ? h('div', { class: spotlightGroupLabelClasses }, group.label)
                            : null,
                          ...group.items.map((result) => {
                            const active = result.flatIndex === activeIndex.value
                            const shortcutLabel = getSpotlightShortcutLabel(result.item.shortcut)
                            const iconNode = slots.icon
                              ? slots.icon({ item: result.item })
                              : (result.item.icon as VNodeChild | undefined)

                            return h(
                              'div',
                              {
                                key: String(result.item.key),
                                id: getPickerOptionId(listboxId, result.flatIndex),
                                ...getPickerOptionAria({
                                  selected: active,
                                  disabled: result.item.disabled
                                }),
                                class: getSpotlightOptionClasses(
                                  active,
                                  result.item.disabled === true
                                ),
                                onMouseenter: () => {
                                  activeIndex.value = result.flatIndex
                                },
                                onMousedown: (event: MouseEvent) => event.preventDefault(),
                                onClick: () => selectItem(result.item)
                              },
                              [
                                iconNode ? h('span', { class: 'shrink-0' }, iconNode) : null,
                                h('span', { class: 'min-w-0 flex-1' }, [
                                  h(
                                    'span',
                                    { class: 'block truncate text-sm font-medium' },
                                    result.item.label
                                  ),
                                  result.item.description
                                    ? h(
                                        'span',
                                        {
                                          class:
                                            'block truncate text-xs text-[var(--tiger-spotlight-item-description,var(--tiger-text-muted,#6b7280))]'
                                        },
                                        result.item.description
                                      )
                                    : null
                                ]),
                                shortcutLabel
                                  ? h(
                                      'kbd',
                                      {
                                        class:
                                          'shrink-0 rounded border border-[var(--tiger-spotlight-shortcut-border,var(--tiger-border,#d1d5db))] px-1.5 py-0.5 text-xs text-[var(--tiger-spotlight-shortcut-text,var(--tiger-text-muted,#6b7280))]'
                                      },
                                      shortcutLabel
                                    )
                                  : null
                              ]
                            )
                          })
                        ]
                      )
                    )
                  )
                : h('div', { class: spotlightEmptyClasses }, props.emptyText)
            ]
          )
        ]
      )

      return renderVueBodyTeleport(content, props.disableTeleport)
    }
  }
})

export default Spotlight

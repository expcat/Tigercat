import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
  type PropType,
  type VNodeChild
} from 'vue'
import {
  captureActiveElement,
  classNames,
  coerceClassValue,
  findSpotlightShortcutItem,
  focusFirst,
  getEmptyLabels,
  getInitialPickerActiveIndex,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  getSpotlightLabels,
  getSpotlightOptionClasses,
  getSpotlightSearchState,
  getSpotlightShortcutLabel,
  isSpotlightToggleHotkey,
  mergeStyleValues,
  mergeTigerLocale,
  restoreFocus,
  shouldCloseOnMaskClick,
  spotlightEmptyClasses,
  spotlightGroupClasses,
  spotlightGroupLabelClasses,
  spotlightHeaderClasses,
  spotlightInputClasses,
  spotlightItemDescriptionClasses,
  spotlightListClasses,
  spotlightMaskClasses,
  spotlightPanelClasses,
  spotlightRootClasses,
  spotlightShortcutClasses,
  spotlightTitleClasses,
  type SpotlightItem,
  type SpotlightItemFilter,
  type TigerLocale,
  OVERLAY_Z_INDEX
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import {
  renderVueBodyTeleport,
  useVueBodyScrollLock,
  useVueEscapeKey,
  useVueFocusTrap
} from '../utils/overlay'

export type VueSpotlightProps = InstanceType<typeof Spotlight>['$props']
export type SpotlightProps = VueSpotlightProps

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
      default: undefined
    },
    placeholder: {
      type: String,
      default: undefined
    },
    emptyText: {
      type: String,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
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
      default: OVERLAY_Z_INDEX.modal
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
    hotkey: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: true
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: ['update:open', 'open-change', 'update:query', 'query-change', 'select'],
  setup(props, { emit, attrs, slots, expose }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getSpotlightLabels(mergedLocale.value))
    const emptyLabels = computed(() => getEmptyLabels(mergedLocale.value))
    const resolvedTitle = computed(() =>
      props.title === undefined ? labels.value.title : props.title
    )
    const placeholderText = computed(() => props.placeholder ?? labels.value.placeholder)
    const emptyMessage = computed(() => props.emptyText ?? emptyLabels.value.noResults)

    const uncontrolledOpen = ref(props.defaultOpen)
    const uncontrolledQuery = ref(props.defaultQuery)
    const activeIndex = ref(-1)
    const instanceId = useId()
    const dialogId = `tiger-spotlight-${instanceId}`
    const titleId = `${dialogId}-title`
    const listboxId = `${dialogId}-listbox`
    const overlayHostId = `${dialogId}-overlay-host`
    const rootRef = ref<HTMLElement | null>(null)
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
    }

    const setQueryValue = (nextQuery: string) => {
      if (props.query === undefined) uncontrolledQuery.value = nextQuery
      emit('update:query', nextQuery)
      emit('query-change', nextQuery)
    }

    const closeSpotlight = () => setOpenValue(false)
    const openSpotlight = () => setOpenValue(true)
    const toggleSpotlight = () => setOpenValue(!resolvedOpen.value)

    expose({
      open: openSpotlight,
      close: closeSpotlight,
      toggle: toggleSpotlight
    })

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
            (result) => result.item.disabled === true,
            { wrap: true }
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
    useVueFocusTrap({ enabled: resolvedOpen, containerRef: rootRef, inert: true })
    let cleanupEscape: (() => void) | undefined

    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (isSpotlightToggleHotkey(event, props.hotkey)) {
        event.preventDefault()
        toggleSpotlight()
        return
      }
      if (!resolvedOpen.value) return
      const item = findSpotlightShortcutItem(event, props.items)
      if (!item) return
      event.preventDefault()
      selectItem(item)
    }

    onMounted(() => {
      cleanupEscape = useVueEscapeKey({
        enabled: resolvedOpen,
        onEscape: closeSpotlight,
        layerRef: rootRef
      })
      document.addEventListener('keydown', onDocumentKeyDown)
    })

    onBeforeUnmount(() => {
      cleanupEscape?.()
      document.removeEventListener('keydown', onDocumentKeyDown)
    })

    watch(
      [
        resolvedOpen,
        resolvedQuery,
        () => props.items,
        () => props.filterItem,
        () => props.limit,
        () => props.defaultActiveFirstItem
      ],
      updateActiveIndex,
      { immediate: true }
    )

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
      { flush: 'post', immediate: true }
    )

    watch(activeIndex, (index) => {
      if (!resolvedOpen.value || index < 0) return
      document
        .getElementById(getPickerOptionId(listboxId, index))
        ?.scrollIntoView({ block: 'nearest' })
    })

    return () => {
      if (!resolvedOpen.value) return null

      const state = searchState.value
      const activeResult = state.flatResults[activeIndex.value]
      const activeOptionId = activeResult
        ? getPickerOptionId(listboxId, activeResult.flatIndex)
        : undefined
      const showTitle = Boolean(resolvedTitle.value)

      const renderOption = (result: (typeof state.flatResults)[number]) => {
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
              selected: false,
              disabled: result.item.disabled
            }),
            class: getSpotlightOptionClasses(active, result.item.disabled === true),
            onMouseenter: () => {
              if (result.item.disabled) return
              activeIndex.value = result.flatIndex
            },
            onMousedown: (event: MouseEvent) => event.preventDefault(),
            onClick: () => selectItem(result.item)
          },
          [
            iconNode ? h('span', { class: 'shrink-0' }, iconNode) : null,
            h('span', { class: 'min-w-0 flex-1' }, [
              h('span', { class: 'block truncate text-sm font-medium' }, result.item.label),
              result.item.description
                ? h('span', { class: spotlightItemDescriptionClasses }, result.item.description)
                : null
            ]),
            shortcutLabel ? h('kbd', { class: spotlightShortcutClasses }, shortcutLabel) : null
          ]
        )
      }

      const content = h(
        'div',
        {
          ref: rootRef,
          class: spotlightRootClasses,
          style: { zIndex: props.zIndex },
          'data-tiger-spotlight-root': '',
          'data-tiger-overlay-layer': ''
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
              id: dialogId,
              role: 'dialog',
              'aria-modal': 'true',
              'aria-labelledby': showTitle ? titleId : undefined,
              'aria-label': showTitle ? undefined : labels.value.title,
              'aria-owns': overlayHostId,
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
                showTitle
                  ? h('div', { id: titleId, class: spotlightTitleClasses }, resolvedTitle.value)
                  : null,
                h('input', {
                  ref: inputRef,
                  value: resolvedQuery.value,
                  type: 'search',
                  class: spotlightInputClasses,
                  placeholder: placeholderText.value,
                  'aria-label': props.inputAriaLabel ?? placeholderText.value,
                  autocomplete: 'off',
                  ...getPickerComboboxAria({
                    expanded: true,
                    listboxId,
                    activeOptionId,
                    autocomplete: 'list'
                  }),
                  onInput: (event: Event) =>
                    setQueryValue((event.target as HTMLInputElement).value),
                  onKeydown: handleKeyDown
                })
              ]),
              h(
                'div',
                {
                  ...getPickerListboxAria({ id: listboxId, label: props.listboxLabel }),
                  class: spotlightListClasses
                },
                state.groups.flatMap((group, groupIndex) => {
                  const options = group.items.map(renderOption)
                  if (!group.label) return options
                  return [
                    h(
                      'div',
                      {
                        key: group.label ?? `group-${groupIndex}`,
                        class: spotlightGroupClasses,
                        role: 'group',
                        'aria-label': group.label
                      },
                      [
                        h(
                          'div',
                          { class: spotlightGroupLabelClasses, 'aria-hidden': 'true' },
                          group.label
                        ),
                        ...options
                      ]
                    )
                  ]
                })
              ),
              state.flatResults.length === 0
                ? h('div', { class: spotlightEmptyClasses }, emptyMessage.value)
                : null
            ]
          ),
          h('div', { id: overlayHostId, class: 'contents', 'data-tiger-overlay-host': '' })
        ]
      )

      return renderVueBodyTeleport(content)
    }
  }
})

export default Spotlight

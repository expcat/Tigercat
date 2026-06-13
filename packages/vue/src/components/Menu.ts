import {
  defineComponent,
  computed,
  ref,
  provide,
  inject,
  PropType,
  h,
  type ComputedRef,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
  cloneVNode,
  isVNode,
  type VNode
} from 'vue'
import {
  classNames,
  coerceClassValue,
  getMenuClasses,
  getMenuItemClasses,
  getMenuItemIndent,
  getSubMenuTitleClasses,
  getSubMenuExpandIconClasses,
  getSubmenuPopupZIndex,
  getTransformOrigin,
  filterMenuItems,
  isKeySelected,
  isKeyOpen,
  menuItemIconClasses,
  menuCollapsedIconClasses,
  menuItemGroupTitleClasses,
  menuSearchFieldClasses,
  menuSearchEmptyClasses,
  menuSearchInputClasses,
  mergeStyleValues,
  moveFocusInMenu,
  focusMenuEdge,
  focusFirstChildItem,
  submenuContentHorizontalClasses,
  submenuContentHorizontalNestedClasses,
  submenuContentPopupClasses,
  submenuContentVerticalClasses,
  submenuContentInlineClasses,
  submenuHeightTransitionClasses,
  getInitialSubmenuHeightTransitionStyle,
  createSubmenuHeightTransitionController,
  type SubmenuHeightTransitionController,
  type FloatingPlacement,
  type MenuMode,
  type MenuTheme,
  type MenuKey,
  type MenuItem as CoreMenuItem,
  type MenuProps as CoreMenuProps,
  replaceKeys,
  toggleKey,
  initRovingTabIndex
} from '@expcat/tigercat-core'
import { renderVueBodyTeleport, useVueFloating } from '../utils/overlay'

// Menu context key
export const MenuContextKey = Symbol('MenuContext')

// Menu context interface
export interface MenuContext {
  mode: ComputedRef<MenuMode>
  theme: ComputedRef<MenuTheme>
  collapsed: ComputedRef<boolean>
  inlineIndent: ComputedRef<number>
  popupPortal: ComputedRef<boolean>
  selectedKeys: ComputedRef<MenuKey[]>
  openKeys: ComputedRef<MenuKey[]>
  handleSelect: (key: string | number) => void
  handleOpenChange: (key: string | number) => void
}

export interface VueMenuProps {
  items?: CoreMenuItem[]
  mode?: MenuMode
  theme?: MenuTheme
  selectedKeys?: MenuKey[]
  defaultSelectedKeys?: MenuKey[]
  openKeys?: MenuKey[]
  defaultOpenKeys?: MenuKey[]
  collapsed?: boolean
  multiple?: boolean
  inlineIndent?: number
  popupPortal?: boolean
  className?: string
  style?: CoreMenuProps['style']
  searchable?: boolean
  searchValue?: string
  defaultSearchValue?: string
  searchPlaceholder?: string
  emptyText?: string
}

export const Menu = defineComponent({
  name: 'TigerMenu',
  inheritAttrs: false,
  props: {
    /**
     * Data-driven menu items
     */
    items: {
      type: Array as PropType<CoreMenuItem[]>,
      default: undefined
    },
    /**
     * Menu mode - horizontal, vertical, or inline
     * @default 'vertical'
     */
    mode: {
      type: String as PropType<MenuMode>,
      default: 'vertical' as MenuMode
    },
    /**
     * Menu theme - light or dark
     * @default 'light'
     */
    theme: {
      type: String as PropType<MenuTheme>,
      default: 'light' as MenuTheme
    },
    /**
     * Currently selected menu item keys
     */
    selectedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: undefined
    },
    /**
     * Default selected menu item keys
     */
    defaultSelectedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => []
    },
    /**
     * Currently opened submenu keys (for vertical/inline mode)
     */
    openKeys: {
      type: Array as PropType<(string | number)[]>,
      default: undefined
    },
    /**
     * Default opened submenu keys
     */
    defaultOpenKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => []
    },
    /**
     * Whether the menu is collapsed (for vertical mode)
     * @default false
     */
    collapsed: {
      type: Boolean,
      default: false
    },
    /**
     * Whether multiple submenus can be opened at once
     * @default true
     */
    multiple: {
      type: Boolean,
      default: true
    },
    /**
     * Inline indentation for submenu items
     * @default 24
     */
    inlineIndent: {
      type: Number,
      default: 24
    },
    popupPortal: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<CoreMenuProps['style']>,
      default: undefined
    },
    searchable: {
      type: Boolean,
      default: false
    },
    searchValue: {
      type: String,
      default: undefined
    },
    defaultSearchValue: {
      type: String,
      default: ''
    },
    searchPlaceholder: {
      type: String,
      default: 'Search menu'
    },
    emptyText: {
      type: String,
      default: 'No menu items found'
    }
  },
  emits: [
    'update:selectedKeys',
    'update:openKeys',
    'update:searchValue',
    'select',
    'open-change',
    'search'
  ],
  setup(props, { slots, emit, attrs }) {
    const menuEl = ref<HTMLElement | null>(null)
    const resolvedMode = computed<MenuMode>(() =>
      props.collapsed && props.mode === 'inline' ? 'vertical' : props.mode
    )

    // Internal state for uncontrolled mode
    const internalSelectedKeys = ref<MenuKey[]>(props.defaultSelectedKeys)
    const internalOpenKeys = ref<MenuKey[]>(props.defaultOpenKeys)
    const internalSearchValue = ref(props.defaultSearchValue)

    // Computed selected keys (controlled or uncontrolled)
    const currentSelectedKeys = computed(() => {
      return props.selectedKeys !== undefined ? props.selectedKeys : internalSelectedKeys.value
    })

    // Computed open keys (controlled or uncontrolled)
    const currentOpenKeys = computed(() => {
      return props.openKeys !== undefined ? props.openKeys : internalOpenKeys.value
    })

    // Handle menu item selection
    const handleSelect = (key: string | number) => {
      const newSelectedKeys = replaceKeys(key, currentSelectedKeys.value)

      // Update internal state if uncontrolled
      if (props.selectedKeys === undefined) {
        internalSelectedKeys.value = newSelectedKeys
      }

      // Emit events
      emit('update:selectedKeys', newSelectedKeys)
      emit('select', key, { selectedKeys: newSelectedKeys })
    }

    // Handle submenu open/close
    const handleOpenChange = (key: string | number) => {
      const toggled = toggleKey(key, currentOpenKeys.value)
      const newOpenKeys = props.multiple ? toggled : toggled.includes(key) ? [key] : []

      // Update internal state if uncontrolled
      if (props.openKeys === undefined) {
        internalOpenKeys.value = newOpenKeys
      }

      // Emit events
      emit('update:openKeys', newOpenKeys)
      emit('open-change', key, { openKeys: newOpenKeys })
    }

    const handleSearchInput = (event: Event) => {
      const value = (event.target as HTMLInputElement).value

      if (props.searchValue === undefined) {
        internalSearchValue.value = value
      }

      emit('update:searchValue', value)
      emit('search', value)
    }

    // Menu classes
    const menuClasses = computed(() => {
      return classNames(
        getMenuClasses(resolvedMode.value, props.theme, props.collapsed),
        props.className,
        coerceClassValue(attrs.class)
      )
    })

    const menuStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const currentSearchValue = computed(() => {
      return props.searchValue !== undefined ? props.searchValue : internalSearchValue.value
    })

    const filteredItems = computed(() =>
      filterMenuItems(props.items ?? [], currentSearchValue.value)
    )

    const passthroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs
      return rest
    })

    // Provide menu context to child components
    const modeRef = computed(() => resolvedMode.value)
    const themeRef = computed(() => props.theme)
    const collapsedRef = computed(() => props.collapsed)
    const inlineIndentRef = computed(() => props.inlineIndent)
    const popupPortalRef = computed(() => props.popupPortal)

    provide<MenuContext>(MenuContextKey, {
      mode: modeRef,
      theme: themeRef,
      collapsed: collapsedRef,
      inlineIndent: inlineIndentRef,
      popupPortal: popupPortalRef,
      selectedKeys: currentSelectedKeys,
      openKeys: currentOpenKeys,
      handleSelect,
      handleOpenChange
    })

    const runRovingTabIndex = async () => {
      await nextTick()
      if (menuEl.value) initRovingTabIndex(menuEl.value)
    }

    onMounted(() => {
      void runRovingTabIndex()
    })

    watch(
      [modeRef, collapsedRef, currentSelectedKeys, currentOpenKeys, filteredItems],
      () => {
        void runRovingTabIndex()
      },
      { deep: true }
    )

    return () => {
      const renderDataItem = (item: CoreMenuItem): VNode => {
        if (item.children && item.children.length > 0) {
          return h(
            SubMenu,
            {
              key: item.key,
              itemKey: item.key,
              title: item.label,
              icon: item.icon,
              disabled: item.disabled
            },
            () => item.children!.map(renderDataItem)
          )
        }

        return h(
          MenuItem,
          {
            key: item.key,
            itemKey: item.key,
            icon: item.icon,
            disabled: item.disabled
          },
          () => item.label
        )
      }

      const dataChildren = filteredItems.value.map(renderDataItem)
      const slotChildren = slots.default?.() ?? []
      const searchChild = props.searchable
        ? [
            h('li', { role: 'none', class: menuSearchFieldClasses }, [
              h('input', {
                type: 'search',
                value: currentSearchValue.value,
                placeholder: props.searchPlaceholder,
                class: menuSearchInputClasses,
                'aria-label': props.searchPlaceholder,
                onInput: handleSearchInput
              })
            ])
          ]
        : []
      const emptyChild =
        props.items &&
        props.items.length > 0 &&
        dataChildren.length === 0 &&
        slotChildren.length === 0
          ? [
              h('li', { role: 'none' }, [
                h('div', { class: menuSearchEmptyClasses }, props.emptyText)
              ])
            ]
          : []

      return h(
        'ul',
        {
          ref: menuEl,
          class: menuClasses.value,
          style: menuStyle.value,
          role: 'menu',
          'data-tiger-menu-root': 'true',
          'data-tiger-menu-mode': resolvedMode.value,
          'data-tiger-menu-requested-mode': props.mode,
          ...passthroughAttrs.value
        },
        [...searchChild, ...dataChildren, ...slotChildren, ...emptyChild]
      )
    }
  }
})

export default Menu

// --- MenuItem (child component) ---

export interface VueMenuItemProps {
  itemKey: string | number
  disabled?: boolean
  icon?: unknown
  level?: number
  collapsed?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const MenuItem = defineComponent({
  name: 'TigerMenuItem',
  props: {
    /**
     * Unique key for the menu item
     */
    itemKey: {
      type: [String, Number] as PropType<string | number>,
      required: true
    },
    /**
     * Whether the menu item is disabled
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Icon for the menu item
     */
    icon: {
      type: [String, Object] as PropType<unknown>
    },
    level: {
      type: Number,
      default: 0
    },
    collapsed: {
      type: Boolean,
      default: undefined
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
  inheritAttrs: false,
  setup(props, { slots, attrs }) {
    // Inject menu context
    const menuContext = inject<MenuContext>(MenuContextKey)

    if (!menuContext) {
      console.warn('MenuItem must be used within Menu component')
    }

    // Check if this item is selected
    const isSelected = computed(() => {
      if (!menuContext) return false
      return isKeySelected(props.itemKey, menuContext.selectedKeys.value)
    })

    // Menu item classes
    const itemClasses = computed(() => {
      if (!menuContext) {
        return classNames(
          'flex items-center px-4 py-2 cursor-pointer transition-colors duration-200'
        )
      }

      const effectiveCollapsed = props.collapsed ?? menuContext.collapsed.value

      return classNames(
        getMenuItemClasses(
          isSelected.value,
          props.disabled,
          menuContext.theme.value,
          effectiveCollapsed
        ),
        props.className,
        coerceClassValue(attrs.class)
      )
    })

    const indentStyle = computed(() => {
      if (!menuContext || menuContext.mode.value !== 'inline' || props.level === 0) {
        return {}
      }
      return getMenuItemIndent(props.level, menuContext.inlineIndent.value)
    })

    const itemStyle = computed(() => mergeStyleValues(attrs.style, props.style, indentStyle.value))

    const passthroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs
      return rest
    })

    // Handle click
    const handleClick = () => {
      if (!props.disabled && menuContext) {
        menuContext.handleSelect(props.itemKey)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!menuContext) return
      const current = event.currentTarget as HTMLButtonElement
      const rootMenu = current.closest('ul[role="menu"]') as HTMLElement | null
      const isRoot = rootMenu?.dataset.tigerMenuRoot === 'true'
      const isHorizontalRoot = isRoot && menuContext.mode.value === 'horizontal'

      const nextKey = isHorizontalRoot ? 'ArrowRight' : 'ArrowDown'
      const prevKey = isHorizontalRoot ? 'ArrowLeft' : 'ArrowUp'

      if (event.key === nextKey) {
        event.preventDefault()
        moveFocusInMenu(current, 1)
        return
      }

      if (event.key === prevKey) {
        event.preventDefault()
        moveFocusInMenu(current, -1)
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        focusMenuEdge(current, 'start')
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        focusMenuEdge(current, 'end')
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleClick()
      }
    }

    return () => {
      const children = []
      type HChildren = Parameters<typeof h>[2]

      const effectiveCollapsed =
        props.collapsed ?? (menuContext ? menuContext.collapsed.value : false)

      // Render icon if provided
      const iconClasses = effectiveCollapsed ? menuCollapsedIconClasses : menuItemIconClasses
      if (props.icon) {
        if (typeof props.icon === 'string') {
          children.push(
            h('span', {
              class: iconClasses,
              innerHTML: props.icon
            })
          )
        } else {
          children.push(h('span', { class: iconClasses }, props.icon as HChildren))
        }
      }

      // Render label (slot content)
      if (!effectiveCollapsed && slots.default) {
        children.push(h('span', { class: 'flex-1' }, slots.default()))
      } else if (effectiveCollapsed && slots.default) {
        if (!props.icon) {
          // Show first letter when collapsed without icon; the full label is
          // kept below as sr-only so the accessible name stays complete.
          const defaultSlot = slots.default()
          if (defaultSlot && defaultSlot.length > 0) {
            const text = String(defaultSlot[0].children || '')
            children.push(
              h(
                'span',
                { class: 'flex-1 text-center', 'aria-hidden': 'true' },
                text.charAt(0).toUpperCase()
              )
            )
          }
        }
        // Keep the full label in the DOM for screen readers
        children.push(h('span', { class: 'sr-only' }, slots.default()))
      }

      return h(
        'li',
        {
          role: 'none'
        },
        [
          h(
            'button',
            {
              type: 'button',
              class: itemClasses.value,
              style: itemStyle.value,
              role: 'menuitem',
              'data-tiger-menuitem': 'true',
              'data-tiger-selected': isSelected.value ? 'true' : 'false',
              'aria-current': isSelected.value ? 'page' : undefined,
              'aria-disabled': props.disabled ? 'true' : undefined,
              disabled: props.disabled,
              tabindex: -1,
              onClick: handleClick,
              onKeydown: handleKeyDown,
              ...passthroughAttrs.value
            },
            children
          )
        ]
      )
    }
  }
})

// --- MenuItemGroup (child component) ---

export interface VueMenuItemGroupProps {
  title?: string
  level?: number
  collapsed?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const MenuItemGroup = defineComponent({
  name: 'TigerMenuItemGroup',
  inheritAttrs: false,
  props: {
    /**
     * Group title
     */
    title: {
      type: String,
      default: ''
    },
    level: {
      type: Number,
      default: 0
    },
    collapsed: {
      type: Boolean,
      default: undefined
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
  setup(props, { slots, attrs }) {
    const groupClasses = computed(() => classNames(props.className, coerceClassValue(attrs.class)))

    const groupStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const passthroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs
      return rest
    })

    const withLevel = (nodes: VNode[] | undefined): VNode[] | undefined => {
      if (!nodes || nodes.length === 0) return nodes
      const level = props.level

      return nodes.map((node) => {
        if (!isVNode(node)) return node
        const type = node.type as unknown
        const name =
          typeof type === 'object' && type != null && 'name' in type
            ? (type as { name?: unknown }).name
            : undefined

        const isTarget = name === 'TigerMenuItem' || name === 'TigerSubMenu'
        if (!isTarget) return node

        const existingProps = (node.props ?? {}) as Record<string, unknown>
        if (existingProps.level != null && existingProps.collapsed != null) return node

        const nextProps: Record<string, unknown> = {}
        if (existingProps.level == null) nextProps.level = level
        if (props.collapsed !== undefined && existingProps.collapsed == null) {
          nextProps.collapsed = props.collapsed
        }

        return cloneVNode(node, nextProps)
      })
    }

    return () => {
      return h('li', { class: 'list-none' }, [
        props.title ? h('div', { class: menuItemGroupTitleClasses }, props.title) : null,
        slots.default
          ? h(
              'ul',
              {
                role: 'group',
                class: groupClasses.value,
                style: groupStyle.value,
                ...passthroughAttrs.value
              },
              withLevel(slots.default?.() as VNode[] | undefined)
            )
          : null
      ])
    }
  }
})

// --- SubMenu (child component) ---

export interface VueSubMenuProps {
  itemKey: string | number
  title?: string
  icon?: unknown
  disabled?: boolean
  level?: number
  collapsed?: boolean
  className?: string
  style?: Record<string, string | number>
}

// Expand/collapse icon
const ExpandIcon = (expanded: boolean) => {
  return h(
    'svg',
    {
      class: getSubMenuExpandIconClasses(expanded),
      width: '12',
      height: '12',
      viewBox: '0 0 12 12',
      fill: 'currentColor'
    },
    [
      h('path', {
        d: 'M6 9L1.5 4.5L2.205 3.795L6 7.59L9.795 3.795L10.5 4.5L6 9Z'
      })
    ]
  )
}

export const SubMenu = defineComponent({
  name: 'TigerSubMenu',
  inheritAttrs: false,
  props: {
    /**
     * Unique key for the submenu
     */
    itemKey: {
      type: [String, Number] as PropType<string | number>,
      required: true
    },
    /**
     * Submenu title
     */
    title: {
      type: String,
      default: ''
    },
    /**
     * Icon for the submenu
     */
    icon: {
      type: [String, Object] as PropType<unknown>
    },
    /**
     * Whether the submenu is disabled
     */
    disabled: {
      type: Boolean,
      default: false
    },
    /**
     * Nesting level (internal use for indentation)
     */
    level: {
      type: Number,
      default: 0
    },
    collapsed: {
      type: Boolean,
      default: undefined
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
  setup(props, { slots, attrs }) {
    // Inject menu context
    const menuContext = inject<MenuContext>(MenuContextKey)

    if (!menuContext) {
      console.warn('SubMenu must be used within Menu component')
    }

    // Check if this submenu is open
    const isOpen = computed(() => {
      if (!menuContext) return false
      return isKeyOpen(props.itemKey, menuContext.openKeys.value)
    })

    // For horizontal mode, track hover state
    const isHovered = ref(false)

    const isOpenByKeyboard = ref(false)
    const titleEl = ref<HTMLElement | null>(null)
    const popupEl = ref<HTMLElement | null>(null)
    const submenuContentEl = ref<HTMLElement | null>(null)
    let heightTransitionController: SubmenuHeightTransitionController | null = null
    let popupCloseTimer: ReturnType<typeof setTimeout> | null = null

    const effectiveCollapsed = computed(() => {
      return props.collapsed ?? (menuContext ? menuContext.collapsed.value : false)
    })

    const isPopup = computed(() => {
      if (!menuContext) return false
      if (menuContext.mode.value === 'horizontal') return true
      return menuContext.mode.value === 'vertical' && effectiveCollapsed.value
    })

    const popupPortal = computed(() => Boolean(isPopup.value && menuContext?.popupPortal.value))

    // Determine if submenu should be shown
    const isExpanded = computed(() => {
      if (menuContext?.mode.value === 'horizontal' || isPopup.value) {
        return isHovered.value || isOpenByKeyboard.value
      }
      return isOpen.value
    })

    const hasRenderedInline = ref(!isPopup.value && isExpanded.value)

    const popupPlacement = computed<FloatingPlacement>(() =>
      menuContext?.mode.value === 'horizontal' && props.level === 0 ? 'bottom-start' : 'right-start'
    )

    const {
      x: popupX,
      y: popupY,
      placement: currentPopupPlacement
    } = useVueFloating({
      referenceRef: titleEl,
      floatingRef: popupEl,
      enabled: computed(() => popupPortal.value && isExpanded.value),
      placement: popupPlacement.value,
      offset: 4
    })

    const disposeHeightTransition = () => {
      heightTransitionController?.dispose()
      heightTransitionController = null
    }

    const syncHeightTransition = async () => {
      await nextTick()

      if (isPopup.value || !hasRenderedInline.value || !submenuContentEl.value) {
        disposeHeightTransition()
        return
      }

      if (!heightTransitionController) {
        heightTransitionController = createSubmenuHeightTransitionController(
          submenuContentEl.value,
          { expanded: isExpanded.value }
        )
        return
      }

      heightTransitionController.update(isExpanded.value)
    }

    watch(
      [isPopup, isExpanded],
      () => {
        if (!isPopup.value && isExpanded.value) {
          hasRenderedInline.value = true
        }
        void syncHeightTransition()
      },
      { immediate: true }
    )

    watch(hasRenderedInline, () => {
      void syncHeightTransition()
    })

    onBeforeUnmount(() => {
      disposeHeightTransition()
      if (popupCloseTimer) clearTimeout(popupCloseTimer)
    })

    // Submenu title classes
    const titleClasses = computed(() => {
      if (!menuContext) return ''
      return classNames(
        getSubMenuTitleClasses(menuContext.theme.value, props.disabled),
        props.className,
        coerceClassValue(attrs.class)
      )
    })

    const titleStyle = computed(() => mergeStyleValues(attrs.style, props.style, indentStyle.value))

    const passthroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs
      return rest
    })

    // Submenu content classes
    const contentClasses = computed(() => {
      if (!menuContext) return ''

      if (menuContext.mode.value === 'horizontal') {
        // Top-level drops below; nested cascades right
        return props.level === 0
          ? submenuContentHorizontalClasses
          : submenuContentHorizontalNestedClasses
      }

      if (isPopup.value) return submenuContentPopupClasses

      if (menuContext.mode.value === 'inline') return submenuContentInlineClasses

      return submenuContentVerticalClasses
    })

    // Dynamic z-index for popup layers
    const popupZIndex = computed(() => (isPopup.value ? getSubmenuPopupZIndex(props.level) : {}))

    // Handle title click
    const handleTitleClick = () => {
      if (!menuContext || props.disabled) return
      if (menuContext.mode.value === 'horizontal') return

      if (isPopup.value) {
        isOpenByKeyboard.value = !isOpenByKeyboard.value
        isHovered.value = true
        return
      }

      if (!isOpen.value) {
        hasRenderedInline.value = true
      }
      menuContext.handleOpenChange(props.itemKey)
    }

    const focusFirstChild = async () => {
      await nextTick()
      const titleEl = document.activeElement as HTMLElement | null
      if (titleEl) focusFirstChildItem(titleEl)
    }

    const handleTitleKeyDown = async (event: KeyboardEvent) => {
      if (!menuContext || props.disabled) return
      const current = event.currentTarget as HTMLButtonElement

      const rootMenu = current.closest('ul[role="menu"]') as HTMLElement | null
      const isRoot = rootMenu?.dataset.tigerMenuRoot === 'true'
      const isHorizontalRoot = isRoot && menuContext.mode.value === 'horizontal'

      const nextKey = isHorizontalRoot ? 'ArrowRight' : 'ArrowDown'
      const prevKey = isHorizontalRoot ? 'ArrowLeft' : 'ArrowUp'

      if (event.key === nextKey) {
        event.preventDefault()
        moveFocusInMenu(current, 1)
        return
      }

      if (event.key === prevKey) {
        event.preventDefault()
        moveFocusInMenu(current, -1)
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        focusMenuEdge(current, 'start')
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        focusMenuEdge(current, 'end')
        return
      }

      if (event.key === 'Escape' || event.key === 'ArrowLeft') {
        if (menuContext.mode.value === 'horizontal' || isPopup.value) {
          event.preventDefault()
          isOpenByKeyboard.value = false
          isHovered.value = false
          return
        }

        if (isOpen.value) {
          event.preventDefault()
          menuContext.handleOpenChange(props.itemKey)
        }
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (menuContext.mode.value === 'horizontal' || isPopup.value) {
          isOpenByKeyboard.value = true
          return
        }
        hasRenderedInline.value = true
        menuContext.handleOpenChange(props.itemKey)
        await focusFirstChild()
        return
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        if (menuContext.mode.value === 'horizontal' || isPopup.value) {
          event.preventDefault()
          isOpenByKeyboard.value = true
          return
        }

        if (!isOpen.value) {
          event.preventDefault()
          hasRenderedInline.value = true
          menuContext.handleOpenChange(props.itemKey)
          await focusFirstChild()
        }
      }
    }

    // Handle mouse enter for horizontal mode
    const handleMouseEnter = () => {
      if (popupCloseTimer) {
        clearTimeout(popupCloseTimer)
        popupCloseTimer = null
      }
      if (menuContext?.mode.value === 'horizontal' || isPopup.value) {
        isHovered.value = true
      }
    }

    // Handle mouse leave for horizontal mode
    const handleMouseLeave = () => {
      if (menuContext?.mode.value === 'horizontal' || isPopup.value) {
        const close = () => {
          isHovered.value = false
          isOpenByKeyboard.value = false
        }

        if (popupPortal.value) {
          popupCloseTimer = setTimeout(close, 120)
          return
        }

        close()
      }
    }

    // Get indent style for nested menus in inline/vertical mode
    const indentStyle = computed(() => {
      if (!menuContext || menuContext.mode.value === 'horizontal' || props.level === 0) {
        return {}
      }
      return getMenuItemIndent(props.level, menuContext.inlineIndent.value)
    })

    const withChildLevel = (nodes: VNode[] | undefined): VNode[] | undefined => {
      if (!nodes || nodes.length === 0) return nodes
      const nextLevel = props.level + 1

      return nodes.map((node) => {
        if (!isVNode(node)) return node
        const type = node.type as unknown

        const name =
          typeof type === 'object' && type != null && 'name' in type
            ? (type as { name?: unknown }).name
            : undefined

        const isTarget =
          name === 'TigerMenuItem' || name === 'TigerSubMenu' || name === 'TigerMenuItemGroup'

        if (!isTarget) return node

        const existingProps = (node.props ?? {}) as Record<string, unknown>

        const nextProps: Record<string, unknown> = {
          level: existingProps.level ?? nextLevel
        }

        if (existingProps.collapsed == null && isPopup.value) {
          nextProps.collapsed = false
        }

        return cloneVNode(node, nextProps)
      })
    }

    return () => {
      if (!menuContext) return null

      const titleChildren = []
      type HChildren = Parameters<typeof h>[2]

      // Render icon if provided
      const submenuIconClasses = effectiveCollapsed.value
        ? menuCollapsedIconClasses
        : menuItemIconClasses
      if (props.icon) {
        if (typeof props.icon === 'string') {
          titleChildren.push(
            h('span', {
              class: submenuIconClasses,
              innerHTML: props.icon
            })
          )
        } else {
          titleChildren.push(h('span', { class: submenuIconClasses }, props.icon as HChildren))
        }
      }

      // Render title text
      if (!effectiveCollapsed.value) {
        titleChildren.push(h('span', { class: 'flex-1' }, props.title))

        // Add expand icon
        if (menuContext.mode.value !== 'horizontal' && !isPopup.value) {
          titleChildren.push(ExpandIcon(isExpanded.value))
        }
      } else {
        if (!props.icon) {
          // Show first letter when collapsed without icon; the full title is
          // kept below as sr-only so the accessible name stays complete.
          titleChildren.push(
            h(
              'span',
              { class: 'flex-1 text-center', 'aria-hidden': 'true' },
              props.title.charAt(0).toUpperCase()
            )
          )
        }
        // Keep the full title in the DOM for screen readers
        titleChildren.push(h('span', { class: 'sr-only' }, props.title))
      }

      // Render submenu title
      const titleNode = h(
        'button',
        {
          type: 'button',
          ref: titleEl,
          class: titleClasses.value,
          style: titleStyle.value,
          onClick: handleTitleClick,
          onKeydown: handleTitleKeyDown,
          role: 'menuitem',
          'data-tiger-menuitem': 'true',
          'aria-expanded': isExpanded.value ? 'true' : 'false',
          'aria-haspopup': 'true',
          'aria-disabled': props.disabled ? 'true' : undefined,
          disabled: props.disabled,
          tabindex: -1,
          ...passthroughAttrs.value
        },
        titleChildren
      )

      // Render submenu content
      const popupContentNode = () => {
        const popupStyle = popupPortal.value
          ? {
              display: isExpanded.value ? 'block' : 'none',
              position: 'absolute' as const,
              left: `${popupX.value}px`,
              top: `${popupY.value}px`,
              transformOrigin: getTransformOrigin(currentPopupPlacement.value),
              ...popupZIndex.value
            }
          : {
              display: isExpanded.value ? 'block' : 'none',
              ...popupZIndex.value
            }

        const node = h(
          'ul',
          {
            ref: popupPortal.value ? popupEl : undefined,
            class: contentClasses.value,
            style: popupStyle,
            role: 'menu',
            'aria-hidden': isExpanded.value ? undefined : 'true',
            onMouseenter: popupPortal.value ? handleMouseEnter : undefined,
            onMouseleave: popupPortal.value ? handleMouseLeave : undefined,
            'data-tiger-submenu-popup': ''
          },
          withChildLevel(slots.default?.() as VNode[] | undefined)
        )

        return popupPortal.value ? renderVueBodyTeleport(node) : node
      }

      const contentNode = isPopup.value
        ? popupContentNode()
        : hasRenderedInline.value
          ? h(
              'div',
              {
                ref: submenuContentEl,
                class: submenuHeightTransitionClasses,
                style: heightTransitionController
                  ? undefined
                  : getInitialSubmenuHeightTransitionStyle(isExpanded.value),
                'aria-hidden': isExpanded.value ? undefined : 'true',
                'data-tiger-menu-hidden': isExpanded.value ? undefined : 'true',
                'data-tiger-submenu-motion': 'height'
              },
              [
                h(
                  'ul',
                  {
                    class: contentClasses.value,
                    role: 'menu'
                  },
                  withChildLevel(slots.default?.() as VNode[] | undefined)
                )
              ]
            )
          : null

      return h(
        'li',
        {
          class: isPopup.value && !popupPortal.value ? 'relative' : '',
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave,
          role: 'none'
        },
        [titleNode, contentNode]
      )
    }
  }
})

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
  onBeforeUnmount,
  cloneVNode,
  isVNode,
  type VNode,
  useId
} from 'vue'
import {
  classNames,
  coerceClassValue,
  createSubmenuHeightTransitionController,
  devWarn,
  focusFirstChildItem,
  focusMenuEdge,
  getMenuClasses,
  getMenuCollapsedInitial,
  getMenuItemClasses,
  getMenuItemIndent,
  getMenuItemKind,
  getMenuListRole,
  getMenuNavigationKeys,
  getMenuPlainText,
  getMenuPopupPlacement,
  getSubMenuExpandIconClasses,
  getSubMenuTitleClasses,
  hasSelectedMenuDescendant,
  isKeyOpen,
  isKeySelected,
  isMenuRoving,
  isSubmenuPopup,
  MENU_POPUP_HOVER_CLOSE_MS,
  menuCollapsedIconClasses,
  menuItemGroupTitleClasses,
  menuItemIconClasses,
  menuSearchEmptyClasses,
  menuSearchFieldClasses,
  menuSearchInputClasses,
  mergeStyleValues,
  mergeTigerLocale,
  moveFocusInMenu,
  nextOpenKeys,
  nextSelectedKeys,
  reconcileSearchOpenKeys,
  resolveMenuCollapsed,
  resolveMenuIconKind,
  resolveMenuMode,
  resolveSearchFilter,
  sameMenuKey,
  shouldIndentMenuItem,
  submenuContentInlineClasses,
  submenuContentPopupClasses,
  submenuContentVerticalClasses,
  submenuHeightTransitionClasses,
  warnControlledSearchOpenKeys,
  type FloatingPlacement,
  type MenuFilterMode,
  type MenuItem as CoreMenuItem,
  type MenuKey,
  type MenuMode,
  type MenuProps as CoreMenuProps,
  type MenuTheme,
  type SubmenuHeightTransitionController
} from '@expcat/tigercat-core'
import { renderVueOverlayTeleport, useVueAnchoredOverlay } from '../utils/overlay'
import { SidebarContextKey } from '../utils/layout-context'
import { useTigerConfig } from './ConfigProvider'
import { Icon } from './Icon'

export const MenuContextKey = Symbol('MenuContext')
export const SubMenuScopeKey = Symbol('SubMenuScope')

export interface MenuContext {
  mode: ComputedRef<MenuMode>
  theme: ComputedRef<MenuTheme>
  collapsed: ComputedRef<boolean>
  inlineIndent: ComputedRef<number>
  popupPortal: ComputedRef<boolean>
  selectedKeys: ComputedRef<MenuKey[]>
  openKeys: ComputedRef<MenuKey[]>
  dir: ComputedRef<'ltr' | 'rtl'>
  handleSelect: (key: MenuKey) => void
  handleOpenChange: (key: MenuKey, open?: boolean) => void
  tabStopKey: ComputedRef<MenuKey | undefined>
}

export interface SubMenuScope {
  itemKey: MenuKey
  popup: boolean
  titleEl: { value: HTMLElement | null }
  close: () => void
}

export function useMenuContext(): MenuContext | null {
  return inject(MenuContextKey, null)
}

function warnMissingMenuContext(component: 'MenuItem' | 'SubMenu'): void {
  devWarn(`Menu.${component}.context`, `${component} must be used within Menu component`)
}

function getVueSlotPlainText(nodes: VNode[] | undefined): string | null {
  if (!nodes || nodes.length === 0) return null
  return getMenuPlainText(
    nodes.map((node) => (typeof node.children === 'string' ? node.children : node))
  )
}

function asVNodeList(value: unknown): VNode[] {
  if (Array.isArray(value)) return value.filter(isVNode)
  if (isVNode(value)) return [value]
  return []
}

function collectVueMenuKeys(nodes: VNode[] | undefined): MenuKey[] {
  if (!nodes) return []
  const keys: MenuKey[] = []
  const walk = (list: VNode[]) => {
    for (const node of list) {
      if (!isVNode(node)) continue
      const props = (node.props ?? {}) as { itemKey?: MenuKey }
      if (props.itemKey != null) keys.push(props.itemKey)
      const children = node.children
      if (Array.isArray(children)) walk(asVNodeList(children))
      else if (children && typeof children === 'object' && 'default' in children) {
        const inner = (children as { default?: () => unknown }).default?.()
        walk(asVNodeList(inner))
      }
    }
  }
  walk(asVNodeList(nodes))
  return keys
}

function renderMenuIcon(icon: unknown, collapsed: boolean) {
  const kind = resolveMenuIconKind(icon)
  if (kind === 'none') return null
  const iconClasses = collapsed ? menuCollapsedIconClasses : menuItemIconClasses
  if (kind === 'name') {
    return h('span', { class: iconClasses }, [h(Icon, { name: icon as string })])
  }
  return h('span', { class: iconClasses }, [icon as VNode])
}

function renderCollapsedLabel(text: string | null, icon: unknown) {
  if (resolveMenuIconKind(icon) !== 'none') {
    return text ? [h('span', { class: 'sr-only' }, text)] : []
  }
  const initial = getMenuCollapsedInitial(text)
  const nodes = []
  if (initial) {
    nodes.push(h('span', { class: 'flex-1 text-center', 'aria-hidden': 'true' }, initial))
  }
  if (text) nodes.push(h('span', { class: 'sr-only' }, text))
  return nodes
}

function withChildProps(
  nodes: VNode[] | undefined,
  next: Record<string, unknown>,
  names: string[]
): VNode[] | undefined {
  if (!nodes || nodes.length === 0) return nodes
  return nodes.map((node) => {
    if (!isVNode(node)) return node
    const type = node.type as unknown
    const name =
      typeof type === 'object' && type != null && 'name' in type
        ? (type as { name?: unknown }).name
        : undefined
    if (typeof name !== 'string' || !names.includes(name)) return node
    return cloneVNode(node, next)
  })
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
  filterMode?: MenuFilterMode
}

export type MenuProps = VueMenuProps

export const Menu = defineComponent({
  name: 'TigerMenu',
  inheritAttrs: false,
  props: {
    items: { type: Array as PropType<CoreMenuItem[]>, default: undefined },
    mode: { type: String as PropType<MenuMode>, default: 'vertical' as MenuMode },
    theme: { type: String as PropType<MenuTheme>, default: 'light' as MenuTheme },
    selectedKeys: { type: Array as PropType<MenuKey[]>, default: undefined },
    defaultSelectedKeys: { type: Array as PropType<MenuKey[]>, default: () => [] },
    openKeys: { type: Array as PropType<MenuKey[]>, default: undefined },
    defaultOpenKeys: { type: Array as PropType<MenuKey[]>, default: () => [] },
    collapsed: { type: Boolean, default: undefined },
    multiple: { type: Boolean, default: true },
    inlineIndent: { type: Number, default: 24 },
    popupPortal: { type: Boolean, default: true },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<CoreMenuProps['style']>, default: undefined },
    searchable: { type: Boolean, default: false },
    searchValue: { type: String, default: undefined },
    defaultSearchValue: { type: String, default: '' },
    searchPlaceholder: { type: String, default: undefined },
    emptyText: { type: String, default: undefined },
    filterMode: {
      type: String as PropType<MenuFilterMode>,
      default: 'subtree' as MenuFilterMode
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
    const sidebarCtx = inject(SidebarContextKey, null)
    const config = useTigerConfig()
    const locale = computed(() => mergeTigerLocale(config.value.locale))
    const dir = computed<'ltr' | 'rtl'>(() => (config.value.direction === 'rtl' ? 'rtl' : 'ltr'))
    const collapsed = computed(() =>
      resolveMenuCollapsed(props.mode, props.collapsed ?? sidebarCtx?.collapsed.value ?? false)
    )
    const resolvedMode = computed<MenuMode>(() => resolveMenuMode(props.mode, collapsed.value))

    const internalSelectedKeys = ref<MenuKey[]>(props.defaultSelectedKeys)
    const internalOpenKeys = ref<MenuKey[]>(props.defaultOpenKeys)
    const internalSearchValue = ref(props.defaultSearchValue)
    const searchExpandKeys = ref<MenuKey[]>([])

    const currentSelectedKeys = computed(() =>
      props.selectedKeys !== undefined ? props.selectedKeys : internalSelectedKeys.value
    )
    const currentOpenKeys = computed(() =>
      props.openKeys !== undefined ? props.openKeys : internalOpenKeys.value
    )
    const currentSearchValue = computed(() =>
      props.searchValue !== undefined ? props.searchValue : internalSearchValue.value
    )

    const handleSelect = (key: MenuKey) => {
      const next = nextSelectedKeys(currentSelectedKeys.value, key)
      if (props.selectedKeys === undefined) internalSelectedKeys.value = next
      emit('update:selectedKeys', next)
      emit('select', key, { selectedKeys: next })
    }

    const handleOpenChange = (key: MenuKey, open?: boolean) => {
      const next = nextOpenKeys({
        current: currentOpenKeys.value,
        key,
        multiple: props.multiple,
        open
      })
      if (props.openKeys === undefined) internalOpenKeys.value = next
      emit('update:openKeys', next)
      emit('open-change', key, { openKeys: next })
    }

    const handleSearchInput = (event: Event) => {
      const value = (event.target as HTMLInputElement).value
      if (props.searchValue === undefined) internalSearchValue.value = value
      emit('update:searchValue', value)
      emit('search', value)
    }

    const searchResult = computed(() =>
      resolveSearchFilter({
        items: props.items,
        query: currentSearchValue.value,
        filterMode: props.filterMode
      })
    )
    const filteredItems = computed(() => searchResult.value.filtered)

    watch(
      () => [currentSearchValue.value, searchResult.value.expandKeys] as const,
      () => {
        const reconciled = reconcileSearchOpenKeys({
          openKeys: currentOpenKeys.value,
          previousSearchExpandKeys: searchExpandKeys.value,
          nextSearchExpandKeys: searchResult.value.expandKeys
        })
        searchExpandKeys.value = reconciled.searchExpandKeys
        const current = currentOpenKeys.value
        const unchanged =
          reconciled.openKeys.length === current.length &&
          reconciled.openKeys.every((key, index) => key === current[index])
        if (!unchanged) {
          if (props.openKeys === undefined) internalOpenKeys.value = reconciled.openKeys
          emit('update:openKeys', reconciled.openKeys)
        }
        warnControlledSearchOpenKeys({
          controlled: props.openKeys !== undefined,
          openKeys: props.openKeys ?? reconciled.openKeys,
          searchExpandKeys: reconciled.searchExpandKeys
        })
      },
      { immediate: true }
    )

    const menuClasses = computed(() =>
      classNames(
        getMenuClasses(resolvedMode.value, props.theme, collapsed.value),
        props.className,
        coerceClassValue(attrs.class)
      )
    )
    const menuStyle = computed(() => mergeStyleValues(attrs.style, props.style))
    const passthroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs
      return rest
    })

    const tabStopKey = computed(() => {
      if (resolvedMode.value !== 'horizontal') return undefined
      const rootKeys =
        props.items && props.items.length > 0
          ? props.items.map((item) => item.key).filter((key): key is MenuKey => key != null)
          : collectVueMenuKeys(slots.default?.())
      const selected = rootKeys.find((key) => isKeySelected(key, currentSelectedKeys.value))
      return selected ?? rootKeys[0]
    })

    provide<MenuContext>(MenuContextKey, {
      mode: resolvedMode,
      theme: computed(() => props.theme),
      collapsed,
      inlineIndent: computed(() => props.inlineIndent),
      popupPortal: computed(() => props.popupPortal),
      selectedKeys: currentSelectedKeys,
      openKeys: currentOpenKeys,
      dir,
      handleSelect,
      handleOpenChange,
      tabStopKey
    })

    const handleSearchKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown') return
      event.preventDefault()
      menuEl.value?.querySelector<HTMLElement>('[data-tiger-menuitem="true"]')?.focus()
    }

    return () => {
      const renderDataItem = (item: CoreMenuItem): VNode => {
        const kind = getMenuItemKind(item)
        if (kind === 'divider') {
          return h('li', {
            key: item.key ?? item.label,
            role: 'separator',
            class: 'my-1 border-t border-[var(--tiger-border,#e5e7eb)]'
          })
        }
        if (kind === 'group') {
          return h(
            MenuItemGroup,
            { key: item.key ?? item.title, title: item.title ?? item.label },
            () => (item.children ?? []).map(renderDataItem)
          )
        }
        if (kind === 'submenu') {
          return h(
            SubMenu,
            {
              key: item.key,
              itemKey: item.key ?? item.label ?? '',
              title: item.label ?? item.title,
              icon: item.icon,
              disabled: item.disabled
            },
            () => (item.children ?? []).map(renderDataItem)
          )
        }
        return h(
          MenuItem,
          {
            key: item.key,
            itemKey: item.key ?? item.label ?? '',
            icon: item.icon,
            disabled: item.disabled,
            href: item.href
          },
          () => item.label
        )
      }

      const dataChildren = filteredItems.value.map(renderDataItem)
      const slotChildren = slots.default?.() ?? []
      const empty =
        props.items &&
        props.items.length > 0 &&
        dataChildren.length === 0 &&
        slotChildren.length === 0

      return h(
        'nav',
        {
          class: menuClasses.value,
          style: menuStyle.value,
          'data-tiger-menu': '',
          'data-tiger-menu-mode': resolvedMode.value,
          'data-tiger-menu-requested-mode': props.mode,
          ...passthroughAttrs.value
        },
        [
          props.searchable
            ? h('div', { class: menuSearchFieldClasses }, [
                h('input', {
                  type: 'search',
                  value: currentSearchValue.value,
                  placeholder:
                    props.searchPlaceholder ?? locale.value?.common?.searchPlaceholder ?? 'Search',
                  class: menuSearchInputClasses,
                  'aria-label':
                    props.searchPlaceholder ?? locale.value?.common?.searchPlaceholder ?? 'Search',
                  onInput: handleSearchInput,
                  onKeydown: handleSearchKeyDown
                })
              ])
            : null,
          empty
            ? h(
                'div',
                { class: menuSearchEmptyClasses },
                props.emptyText ?? locale.value?.common?.emptyText ?? 'No data'
              )
            : null,
          h(
            'ul',
            {
              ref: menuEl,
              role: getMenuListRole(resolvedMode.value, { isRoot: true }),
              'data-tiger-menu-root': 'true',
              'data-tiger-menu-list': '',
              'data-tiger-menu-mode': resolvedMode.value
            },
            [...dataChildren, ...slotChildren]
          )
        ]
      )
    }
  }
})

export default Menu

export interface VueMenuItemProps {
  itemKey: MenuKey
  disabled?: boolean
  icon?: unknown
  href?: string
  level?: number
  collapsed?: boolean
  className?: string
  style?: Record<string, string | number>
}

export type MenuItemProps = VueMenuItemProps

export const MenuItem = defineComponent({
  name: 'TigerMenuItem',
  inheritAttrs: false,
  props: {
    itemKey: { type: [String, Number] as PropType<MenuKey>, required: true },
    disabled: { type: Boolean, default: false },
    icon: { type: [String, Object] as PropType<unknown> },
    href: { type: String, default: undefined },
    level: { type: Number, default: 0 },
    collapsed: { type: Boolean, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined }
  },
  setup(props, { slots, attrs }) {
    const menuContext = inject<MenuContext>(MenuContextKey)
    const submenuScope = inject<SubMenuScope | null>(SubMenuScopeKey, null)
    if (!menuContext) warnMissingMenuContext('MenuItem')

    const isSelected = computed(() =>
      menuContext ? isKeySelected(props.itemKey, menuContext.selectedKeys.value) : false
    )
    const effectiveCollapsed = computed(
      () => props.collapsed ?? (menuContext ? menuContext.collapsed.value : false)
    )
    const inPopup = computed(() => Boolean(submenuScope?.popup))
    const roving = computed(() =>
      Boolean(
        menuContext &&
        isMenuRoving(menuContext.mode.value, { popup: inPopup.value, isRoot: !submenuScope })
      )
    )
    const itemClasses = computed(() => {
      if (!menuContext) {
        return classNames(
          'flex items-center px-4 py-2 cursor-pointer transition-colors duration-200'
        )
      }
      return classNames(
        getMenuItemClasses(
          isSelected.value,
          props.disabled,
          menuContext.theme.value,
          effectiveCollapsed.value
        ),
        props.className,
        coerceClassValue(attrs.class)
      )
    })
    const indentStyle = computed(() => {
      if (!menuContext || !shouldIndentMenuItem(menuContext.mode.value, props.level)) return {}
      return getMenuItemIndent(props.level, menuContext.inlineIndent.value)
    })
    const itemStyle = computed(() => mergeStyleValues(attrs.style, props.style, indentStyle.value))
    const passthroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs
      return rest
    })

    const handleClick = () => {
      if (!props.disabled && menuContext) menuContext.handleSelect(props.itemKey)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!menuContext) return
      const current = event.currentTarget as HTMLElement
      const rootMenu = current.closest('[data-tiger-menu-root="true"]') as HTMLElement | null
      const isRoot = Boolean(rootMenu && current.closest('[data-tiger-menu-list]') === rootMenu)
      const { nextKey, prevKey, closeKey } = getMenuNavigationKeys(
        menuContext.mode.value,
        isRoot,
        menuContext.dir.value
      )
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
      if ((event.key === 'Escape' || event.key === closeKey) && submenuScope) {
        event.preventDefault()
        submenuScope.close()
        submenuScope.titleEl.value?.focus()
      }
    }

    return () => {
      const slotNodes = slots.default?.() ?? []
      const label = getVueSlotPlainText(slotNodes)
      const collapsed = effectiveCollapsed.value
      const children = collapsed
        ? [renderMenuIcon(props.icon, true), ...renderCollapsedLabel(label, props.icon)]
        : [renderMenuIcon(props.icon, false), h('span', { class: 'flex-1' }, slotNodes)]

      const inPopupMenu = inPopup.value
      const usesMenuRole = inPopupMenu || menuContext?.mode.value === 'horizontal'
      const role = usesMenuRole ? 'menuitem' : undefined
      const tabIndex = props.disabled
        ? -1
        : roving.value
          ? menuContext?.tabStopKey.value != null &&
            sameMenuKey(props.itemKey, menuContext.tabStopKey.value)
            ? 0
            : -1
          : 0

      const shared = {
        class: itemClasses.value,
        style: itemStyle.value,
        'data-tiger-menuitem': 'true',
        'data-tiger-selected': isSelected.value ? 'true' : 'false',
        'aria-disabled': props.disabled ? 'true' : undefined,
        tabindex: tabIndex,
        onClick: handleClick,
        onKeydown: handleKeyDown,
        role,
        ...passthroughAttrs.value
      }

      const node = props.href
        ? h(
            'a',
            {
              ...shared,
              href: props.disabled ? undefined : props.href,
              'aria-current': isSelected.value ? 'page' : undefined
            },
            children
          )
        : h(
            'button',
            {
              ...shared,
              type: 'button',
              disabled: props.disabled
            },
            children
          )

      return h('li', { role: usesMenuRole ? 'none' : undefined }, [node])
    }
  }
})

export interface VueMenuItemGroupProps {
  title?: string
  level?: number
  collapsed?: boolean
  className?: string
  style?: Record<string, string | number>
}

export type MenuItemGroupProps = VueMenuItemGroupProps

export const MenuItemGroup = defineComponent({
  name: 'TigerMenuItemGroup',
  inheritAttrs: false,
  props: {
    title: { type: String, default: '' },
    level: { type: Number, default: 0 },
    collapsed: { type: Boolean, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined }
  },
  setup(props, { slots, attrs }) {
    const menuContext = inject<MenuContext | null>(MenuContextKey, null)
    const titleId = useId()
    const groupClasses = computed(() => classNames(props.className, coerceClassValue(attrs.class)))
    const groupStyle = computed(() => mergeStyleValues(attrs.style, props.style))
    const passthroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs
      return rest
    })
    const submenuScope = inject<SubMenuScope | null>(SubMenuScopeKey, null)
    const hidden = computed(() => props.collapsed ?? menuContext?.collapsed.value ?? false)
    const usesMenuRole = computed(
      () => Boolean(submenuScope?.popup) || menuContext?.mode.value === 'horizontal'
    )
    const indentStyle = computed(() => {
      if (!menuContext || !shouldIndentMenuItem(menuContext.mode.value, props.level))
        return undefined
      return getMenuItemIndent(props.level, menuContext.inlineIndent.value)
    })

    return () =>
      h('li', { role: usesMenuRole.value ? 'none' : undefined }, [
        props.title
          ? h(
              'div',
              {
                id: titleId,
                class: classNames(menuItemGroupTitleClasses, hidden.value && 'sr-only'),
                style: indentStyle.value
              },
              props.title
            )
          : null,
        slots.default
          ? h(
              'ul',
              {
                role: usesMenuRole.value ? 'group' : undefined,
                class: groupClasses.value,
                style: groupStyle.value,
                'aria-labelledby': props.title ? titleId : undefined,
                ...passthroughAttrs.value
              },
              withChildProps(
                slots.default() as VNode[],
                { level: props.level, collapsed: props.collapsed },
                ['TigerMenuItem', 'TigerSubMenu']
              )
            )
          : null
      ])
  }
})

export interface VueSubMenuProps {
  itemKey: MenuKey
  title?: string
  icon?: unknown
  disabled?: boolean
  level?: number
  collapsed?: boolean
  className?: string
  style?: Record<string, string | number>
}

export type SubMenuProps = VueSubMenuProps

const ExpandIcon = (expanded: boolean, popup?: boolean) =>
  h(
    'svg',
    {
      class: getSubMenuExpandIconClasses(expanded, { popup }),
      width: '12',
      height: '12',
      viewBox: '0 0 12 12',
      fill: 'currentColor',
      'aria-hidden': 'true',
      focusable: 'false'
    },
    [h('path', { d: 'M6 9L1.5 4.5L2.205 3.795L6 7.59L9.795 3.795L10.5 4.5L6 9Z' })]
  )

export const SubMenu = defineComponent({
  name: 'TigerSubMenu',
  inheritAttrs: false,
  props: {
    itemKey: { type: [String, Number] as PropType<MenuKey>, required: true },
    title: { type: String, default: '' },
    icon: { type: [String, Object] as PropType<unknown> },
    disabled: { type: Boolean, default: false },
    level: { type: Number, default: 0 },
    collapsed: { type: Boolean, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined }
  },
  setup(props, { slots, attrs }) {
    const menuContext = inject<MenuContext>(MenuContextKey)
    const parentScope = inject<SubMenuScope | null>(SubMenuScopeKey, null)
    if (!menuContext) warnMissingMenuContext('SubMenu')

    const titleEl = ref<HTMLElement | null>(null)
    const popupEl = ref<HTMLElement | null>(null)
    const submenuContentEl = ref<HTMLElement | null>(null)
    const titleId = useId()
    const listId = useId()
    let heightTransitionController: SubmenuHeightTransitionController | null = null
    let popupCloseTimer: ReturnType<typeof setTimeout> | null = null

    const effectiveCollapsed = computed(
      () => props.collapsed ?? (menuContext ? menuContext.collapsed.value : false)
    )
    const isPopup = computed(() =>
      menuContext ? isSubmenuPopup(menuContext.mode.value, effectiveCollapsed.value) : false
    )
    const isOpen = computed(() =>
      menuContext ? isKeyOpen(props.itemKey, menuContext.openKeys.value) : false
    )
    const isExpanded = computed(() => isOpen.value)
    const popupPortal = computed(() => Boolean(isPopup.value && menuContext?.popupPortal.value))
    const hasRenderedInline = ref(!isPopup.value && isExpanded.value)
    const popupPlacement = computed<FloatingPlacement>(() =>
      getMenuPopupPlacement(menuContext?.mode.value ?? 'vertical', props.level)
    )
    const overlayEnabled = computed(() => isPopup.value && isExpanded.value)
    const overlayOffset = computed(() => (popupPortal.value ? 4 : 0))

    const overlay = useVueAnchoredOverlay({
      referenceRef: titleEl,
      floatingRef: popupEl,
      enabled: overlayEnabled,
      placement: popupPlacement,
      offset: overlayOffset,
      portal: popupPortal,
      dismissOnEscape: true,
      dismissOnOutside: true,
      onDismiss: () => {
        menuContext?.handleOpenChange(props.itemKey, false)
      }
    })

    const disposeHeightTransition = () => {
      heightTransitionController?.dispose()
      heightTransitionController = null
    }

    watch(
      [isPopup, isExpanded],
      () => {
        if (!isPopup.value && isExpanded.value) hasRenderedInline.value = true
        void nextTick(() => {
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
        })
      },
      { immediate: true }
    )

    onBeforeUnmount(() => {
      disposeHeightTransition()
      if (popupCloseTimer) clearTimeout(popupCloseTimer)
    })

    const descendantKeys = computed(() => collectVueMenuKeys(slots.default?.()))
    const childSelected = computed(() =>
      menuContext
        ? hasSelectedMenuDescendant(menuContext.selectedKeys.value, descendantKeys.value)
        : false
    )

    const titleClasses = computed(() => {
      if (!menuContext) return ''
      return classNames(
        getSubMenuTitleClasses(menuContext.theme.value, props.disabled, {
          collapsed: effectiveCollapsed.value,
          childSelected: childSelected.value
        }),
        props.className,
        coerceClassValue(attrs.class)
      )
    })
    const indentStyle = computed(() => {
      if (!menuContext || !shouldIndentMenuItem(menuContext.mode.value, props.level)) return {}
      return getMenuItemIndent(props.level, menuContext.inlineIndent.value)
    })
    const titleStyle = computed(() => mergeStyleValues(attrs.style, props.style, indentStyle.value))
    const passthroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs
      return rest
    })
    const contentClasses = computed(() => {
      if (!menuContext) return ''
      if (isPopup.value) return submenuContentPopupClasses
      if (menuContext.mode.value === 'inline') return submenuContentInlineClasses
      return submenuContentVerticalClasses
    })

    const clearCloseTimer = () => {
      if (popupCloseTimer) {
        clearTimeout(popupCloseTimer)
        popupCloseTimer = null
      }
    }

    const handleTitleClick = (event: MouseEvent) => {
      if (!menuContext || props.disabled) return
      if (!isPopup.value) hasRenderedInline.value = true
      const pointerType = 'pointerType' in event ? (event as PointerEvent).pointerType : ''
      if (isPopup.value && isExpanded.value && pointerType === 'mouse') return
      menuContext.handleOpenChange(props.itemKey)
    }

    const handleMouseEnter = () => {
      if (!menuContext || props.disabled || !isPopup.value) return
      clearCloseTimer()
      menuContext.handleOpenChange(props.itemKey, true)
    }

    const handleMouseLeave = () => {
      if (!menuContext || !isPopup.value) return
      clearCloseTimer()
      popupCloseTimer = setTimeout(() => {
        menuContext.handleOpenChange(props.itemKey, false)
      }, MENU_POPUP_HOVER_CLOSE_MS)
    }

    const focusFirstChild = (title: HTMLElement) => {
      void nextTick(() => focusFirstChildItem(title, isPopup.value ? popupEl.value : null))
    }

    const handleTitleKeyDown = (event: KeyboardEvent) => {
      if (!menuContext || props.disabled) return
      const current = event.currentTarget as HTMLButtonElement
      const rootMenu = current.closest('[data-tiger-menu-root="true"]') as HTMLElement | null
      const isRoot = Boolean(rootMenu && current.closest('[data-tiger-menu-list]') === rootMenu)
      const { nextKey, prevKey, openKey, closeKey } = getMenuNavigationKeys(
        menuContext.mode.value,
        isRoot,
        menuContext.dir.value
      )

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
      if (event.key === 'Escape' || event.key === closeKey) {
        if (isExpanded.value) {
          event.preventDefault()
          menuContext.handleOpenChange(props.itemKey, false)
          return
        }
        if (parentScope) {
          event.preventDefault()
          parentScope.close()
          parentScope.titleEl.value?.focus()
        }
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!isExpanded.value) {
          hasRenderedInline.value = true
          menuContext.handleOpenChange(props.itemKey, true)
        }
        focusFirstChild(current)
        return
      }
      if (event.key === openKey || (isPopup.value && event.key === 'ArrowDown')) {
        event.preventDefault()
        if (!isExpanded.value) {
          hasRenderedInline.value = true
          menuContext.handleOpenChange(props.itemKey, true)
        }
        focusFirstChild(current)
      }
    }

    const closeSelf = () => menuContext?.handleOpenChange(props.itemKey, false)

    provide<SubMenuScope>(SubMenuScopeKey, {
      itemKey: props.itemKey,
      get popup() {
        return isPopup.value
      },
      titleEl,
      close: closeSelf
    })

    return () => {
      if (!menuContext) return null
      const inPopup = Boolean(parentScope?.popup)
      const roving = isMenuRoving(menuContext.mode.value, {
        popup: inPopup,
        isRoot: !parentScope
      })
      const isTabStop =
        !props.disabled &&
        roving &&
        menuContext.tabStopKey.value != null &&
        sameMenuKey(props.itemKey, menuContext.tabStopKey.value)
      const titleRole = inPopup || menuContext.mode.value === 'horizontal' ? 'menuitem' : undefined
      const listRole = getMenuListRole(menuContext.mode.value, { popup: isPopup.value })
      const collapsed = effectiveCollapsed.value

      const titleChildren = collapsed
        ? [renderMenuIcon(props.icon, true), ...renderCollapsedLabel(props.title, props.icon)]
        : [
            renderMenuIcon(props.icon, false),
            h('span', { class: 'flex-1' }, props.title),
            ExpandIcon(isExpanded.value, isPopup.value)
          ]

      const childNodes = withChildProps(
        slots.default?.() as VNode[] | undefined,
        {
          level: props.level + 1,
          collapsed: isPopup.value ? false : undefined
        },
        ['TigerMenuItem', 'TigerSubMenu', 'TigerMenuItemGroup']
      )

      const titleNode = h(
        'button',
        {
          type: 'button',
          id: titleId,
          ref: titleEl,
          class: titleClasses.value,
          style: titleStyle.value,
          onClick: handleTitleClick,
          onKeydown: handleTitleKeyDown,
          role: titleRole,
          'data-tiger-menuitem': 'true',
          'data-tiger-submenu-title': '',
          'aria-expanded': isExpanded.value ? 'true' : 'false',
          'aria-haspopup': isPopup.value ? 'menu' : undefined,
          'aria-controls': listId,
          'aria-disabled': props.disabled ? 'true' : undefined,
          'data-state': isExpanded.value ? 'open' : 'closed',
          disabled: props.disabled,
          tabindex: props.disabled ? -1 : roving ? (isTabStop ? 0 : -1) : 0,
          ...passthroughAttrs.value
        },
        titleChildren
      )

      const popupContentNode = () => {
        const node = h(
          'ul',
          {
            ref: popupEl,
            id: listId,
            class: classNames(contentClasses.value, overlay.floatingClasses.value),
            style: {
              ...overlay.floatingStyles.value,
              display: isExpanded.value ? 'block' : 'none'
            },
            'data-positioned': overlay.positioned.value,
            role: listRole,
            'aria-labelledby': titleId,
            'aria-hidden': isExpanded.value ? undefined : 'true',
            onMouseenter: handleMouseEnter,
            onMouseleave: handleMouseLeave,
            'data-tiger-menu-list': '',
            'data-tiger-submenu-popup': ''
          },
          childNodes
        )
        return renderVueOverlayTeleport(node, overlay.target.value, !popupPortal.value)
      }

      const contentNode = isPopup.value
        ? popupContentNode()
        : hasRenderedInline.value
          ? h(
              'div',
              {
                ref: submenuContentEl,
                class: submenuHeightTransitionClasses,
                'aria-hidden': isExpanded.value ? undefined : 'true',
                'data-tiger-menu-hidden': isExpanded.value ? undefined : 'true',
                'data-tiger-submenu-motion': 'height'
              },
              [
                h(
                  'ul',
                  {
                    id: listId,
                    class: contentClasses.value,
                    role: listRole,
                    'aria-labelledby': titleId,
                    'data-tiger-menu-list': ''
                  },
                  childNodes
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
          role: inPopup || menuContext.mode.value === 'horizontal' ? 'none' : undefined,
          'data-tiger-submenu': '',
          'data-child-selected': childSelected.value ? 'true' : undefined
        },
        [titleNode, contentNode]
      )
    }
  }
})

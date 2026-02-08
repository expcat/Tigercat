import { defineComponent, computed, inject, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  getMenuItemClasses,
  getMenuItemIndent,
  isKeySelected,
  menuItemIconClasses,
  mergeStyleValues,
  moveFocusInMenu,
  focusMenuEdge
} from '@expcat/tigercat-core'
import { MenuContextKey, type MenuContext } from './Menu'

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
        getMenuItemClasses(isSelected.value, props.disabled, menuContext.theme.value, effectiveCollapsed),
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

      const effectiveCollapsed = props.collapsed ?? (menuContext ? menuContext.collapsed.value : false)

      // Render icon if provided
      if (props.icon) {
        if (typeof props.icon === 'string') {
          children.push(
            h('span', {
              class: menuItemIconClasses,
              innerHTML: props.icon
            })
          )
        } else {
          children.push(h('span', { class: menuItemIconClasses }, props.icon as HChildren))
        }
      }

      // Render label (slot content)
      if (!effectiveCollapsed && slots.default) {
        children.push(h('span', { class: 'flex-1' }, slots.default()))
      } else if (effectiveCollapsed && !props.icon && slots.default) {
        // Show first letter when collapsed without icon
        const defaultSlot = slots.default()
        if (defaultSlot && defaultSlot.length > 0) {
          const text = String(defaultSlot[0].children || '')
          children.push(h('span', { class: 'flex-1 text-center' }, text.charAt(0).toUpperCase()))
        }
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

export default MenuItem

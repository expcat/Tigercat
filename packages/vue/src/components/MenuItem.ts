import { defineComponent, computed, inject, h, PropType } from 'vue';
import {
  classNames,
  getMenuItemClasses,
  isKeySelected,
  menuItemIconClasses,
} from '@tigercat/core';
import { MenuContextKey, type MenuContext } from './Menu';

export const MenuItem = defineComponent({
  name: 'TigerMenuItem',
  props: {
    /**
     * Unique key for the menu item
     */
    itemKey: {
      type: [String, Number] as PropType<string | number>,
      required: true,
    },
    /**
     * Whether the menu item is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Icon for the menu item
     */
    icon: {
      type: [String, Object] as PropType<unknown>,
    },
  },
  setup(props, { slots }) {
    // Inject menu context
    const menuContext = inject<MenuContext>(MenuContextKey);

    if (!menuContext) {
      console.warn('MenuItem must be used within Menu component');
    }

    // Check if this item is selected
    const isSelected = computed(() => {
      if (!menuContext) return false;
      return isKeySelected(props.itemKey, menuContext.selectedKeys);
    });

    // Menu item classes
    const itemClasses = computed(() => {
      if (!menuContext) {
        return classNames(
          'flex items-center px-4 py-2 cursor-pointer transition-colors duration-200'
        );
      }

      return classNames(
        getMenuItemClasses(
          isSelected.value,
          props.disabled,
          menuContext.theme,
          menuContext.collapsed
        )
      );
    });

    // Handle click
    const handleClick = () => {
      if (!props.disabled && menuContext) {
        menuContext.handleSelect(props.itemKey);
      }
    };

    return () => {
      const children = [];
      type HChildren = Parameters<typeof h>[2];

      // Render icon if provided
      if (props.icon) {
        if (typeof props.icon === 'string') {
          children.push(
            h('span', {
              class: menuItemIconClasses,
              innerHTML: props.icon,
            })
          );
        } else {
          children.push(
            h('span', { class: menuItemIconClasses }, props.icon as HChildren)
          );
        }
      }

      // Render label (slot content)
      if (!menuContext?.collapsed && slots.default) {
        children.push(h('span', { class: 'flex-1' }, slots.default()));
      } else if (menuContext?.collapsed && !props.icon && slots.default) {
        // Show first letter when collapsed without icon
        const defaultSlot = slots.default();
        if (defaultSlot && defaultSlot.length > 0) {
          const text = String(defaultSlot[0].children || '');
          children.push(
            h(
              'span',
              { class: 'flex-1 text-center' },
              text.charAt(0).toUpperCase()
            )
          );
        }
      }

      return h(
        'li',
        {
          class: itemClasses.value,
          role: 'menuitem',
          'aria-disabled': props.disabled ? 'true' : undefined,
          onClick: handleClick,
        },
        children
      );
    };
  },
});

export default MenuItem;

import {
  defineComponent,
  computed,
  inject,
  ref,
  h,
  PropType,
  Transition,
} from 'vue';
import {
  classNames,
  getSubMenuTitleClasses,
  getSubMenuExpandIconClasses,
  getMenuItemIndent,
  isKeyOpen,
  menuItemIconClasses,
  submenuContentHorizontalClasses,
  submenuContentVerticalClasses,
} from '@tigercat/core';
import { MenuContextKey, type MenuContext } from './Menu';

// Expand/collapse icon
const ExpandIcon = (expanded: boolean) => {
  return h(
    'svg',
    {
      class: getSubMenuExpandIconClasses(expanded),
      width: '12',
      height: '12',
      viewBox: '0 0 12 12',
      fill: 'currentColor',
    },
    [
      h('path', {
        d: 'M6 9L1.5 4.5L2.205 3.795L6 7.59L9.795 3.795L10.5 4.5L6 9Z',
      }),
    ]
  );
};

export const SubMenu = defineComponent({
  name: 'TigerSubMenu',
  props: {
    /**
     * Unique key for the submenu
     */
    itemKey: {
      type: [String, Number] as PropType<string | number>,
      required: true,
    },
    /**
     * Submenu title
     */
    title: {
      type: String,
      default: '',
    },
    /**
     * Icon for the submenu
     */
    icon: {
      type: [String, Object] as PropType<unknown>,
    },
    /**
     * Whether the submenu is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Nesting level (internal use for indentation)
     */
    level: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { slots }) {
    // Inject menu context
    const menuContext = inject<MenuContext>(MenuContextKey);

    if (!menuContext) {
      console.warn('SubMenu must be used within Menu component');
    }

    // Check if this submenu is open
    const isOpen = computed(() => {
      if (!menuContext) return false;
      return isKeyOpen(props.itemKey, menuContext.openKeys);
    });

    // For horizontal mode, track hover state
    const isHovered = ref(false);

    // Determine if submenu should be shown
    const isExpanded = computed(() => {
      if (menuContext?.mode === 'horizontal') {
        return isHovered.value;
      }
      return isOpen.value;
    });

    // Submenu title classes
    const titleClasses = computed(() => {
      if (!menuContext) return '';
      return classNames(
        getSubMenuTitleClasses(menuContext.theme, props.disabled)
      );
    });

    // Submenu content classes
    const contentClasses = computed(() => {
      if (!menuContext) return '';

      if (menuContext.mode === 'horizontal') {
        return submenuContentHorizontalClasses;
      }
      return submenuContentVerticalClasses;
    });

    // Handle title click
    const handleTitleClick = () => {
      if (!props.disabled && menuContext && menuContext.mode !== 'horizontal') {
        menuContext.handleOpenChange(props.itemKey);
      }
    };

    // Handle mouse enter for horizontal mode
    const handleMouseEnter = () => {
      if (menuContext?.mode === 'horizontal') {
        isHovered.value = true;
      }
    };

    // Handle mouse leave for horizontal mode
    const handleMouseLeave = () => {
      if (menuContext?.mode === 'horizontal') {
        isHovered.value = false;
      }
    };

    // Get indent style for nested menus in inline mode
    const indentStyle = computed(() => {
      if (
        !menuContext ||
        menuContext.mode === 'horizontal' ||
        props.level === 0
      ) {
        return {};
      }
      return getMenuItemIndent(props.level, menuContext.inlineIndent);
    });

    return () => {
      if (!menuContext) return null;

      const titleChildren = [];
      type HChildren = Parameters<typeof h>[2];

      // Render icon if provided
      if (props.icon) {
        if (typeof props.icon === 'string') {
          titleChildren.push(
            h('span', {
              class: menuItemIconClasses,
              innerHTML: props.icon,
            })
          );
        } else {
          titleChildren.push(
            h('span', { class: menuItemIconClasses }, props.icon as HChildren)
          );
        }
      }

      // Render title text
      if (!menuContext.collapsed) {
        titleChildren.push(h('span', { class: 'flex-1' }, props.title));

        // Add expand icon
        if (menuContext.mode !== 'horizontal') {
          titleChildren.push(ExpandIcon(isExpanded.value));
        }
      } else if (!props.icon) {
        // Show first letter when collapsed without icon
        titleChildren.push(
          h(
            'span',
            { class: 'flex-1 text-center' },
            props.title.charAt(0).toUpperCase()
          )
        );
      }

      // Render submenu title
      const titleNode = h(
        'div',
        {
          class: titleClasses.value,
          style: indentStyle.value,
          onClick: handleTitleClick,
          role: 'button',
          'aria-expanded': isExpanded.value ? 'true' : 'false',
          'aria-disabled': props.disabled ? 'true' : undefined,
        },
        titleChildren
      );

      // Render submenu content
      const contentNode =
        menuContext.mode === 'horizontal'
          ? h(
              'ul',
              {
                class: contentClasses.value,
                style: {
                  display: isExpanded.value ? 'block' : 'none',
                },
                role: 'menu',
              },
              slots.default?.()
            )
          : h(
              Transition,
              {
                name: 'submenu-collapse',
                onEnter: (el: Element) => {
                  const element = el as HTMLElement;
                  element.style.height = '0';
                  void element.offsetHeight; // Force reflow
                  element.style.height = element.scrollHeight + 'px';
                },
                onAfterEnter: (el: Element) => {
                  const element = el as HTMLElement;
                  element.style.height = '';
                },
                onLeave: (el: Element) => {
                  const element = el as HTMLElement;
                  element.style.height = element.scrollHeight + 'px';
                  void element.offsetHeight; // Force reflow
                  element.style.height = '0';
                },
                onAfterLeave: (el: Element) => {
                  const element = el as HTMLElement;
                  element.style.height = '';
                },
              },
              {
                default: () =>
                  isExpanded.value
                    ? h(
                        'ul',
                        {
                          class: contentClasses.value,
                          role: 'menu',
                        },
                        slots.default?.()
                      )
                    : null,
              }
            );

      return h(
        'li',
        {
          class: menuContext.mode === 'horizontal' ? 'relative' : '',
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave,
        },
        [titleNode, contentNode]
      );
    };
  },
});

export default SubMenu;

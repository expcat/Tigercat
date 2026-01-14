import {
  defineComponent,
  computed,
  inject,
  ref,
  h,
  PropType,
  Transition,
  nextTick,
  cloneVNode,
  isVNode,
  type VNode,
} from 'vue';
import {
  classNames,
  coerceClassValue,
  getSubMenuTitleClasses,
  getSubMenuExpandIconClasses,
  getMenuItemIndent,
  isKeyOpen,
  menuItemIconClasses,
  mergeStyleValues,
  submenuContentHorizontalClasses,
  submenuContentPopupClasses,
  submenuContentVerticalClasses,
  submenuContentInlineClasses,
} from '@tigercat/core';
import { MenuContextKey, type MenuContext } from './Menu';

export interface VueSubMenuProps {
  itemKey: string | number;
  title?: string;
  icon?: unknown;
  disabled?: boolean;
  level?: number;
  collapsed?: boolean;
  className?: string;
  style?: Record<string, string | number>;
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
  inheritAttrs: false,
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
    collapsed: {
      type: Boolean,
      default: undefined,
    },
    className: {
      type: String,
      default: undefined,
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    // Inject menu context
    const menuContext = inject<MenuContext>(MenuContextKey);

    if (!menuContext) {
      console.warn('SubMenu must be used within Menu component');
    }

    // Check if this submenu is open
    const isOpen = computed(() => {
      if (!menuContext) return false;
      return isKeyOpen(props.itemKey, menuContext.openKeys.value);
    });

    // For horizontal mode, track hover state
    const isHovered = ref(false);

    const isOpenByKeyboard = ref(false);

    const effectiveCollapsed = computed(() => {
      return props.collapsed ?? (menuContext ? menuContext.collapsed : false);
    });

    const isPopup = computed(() => {
      return (
        !!menuContext &&
        menuContext.mode === 'vertical' &&
        effectiveCollapsed.value
      );
    });

    // Determine if submenu should be shown
    const isExpanded = computed(() => {
      if (menuContext?.mode === 'horizontal' || isPopup.value) {
        return isHovered.value || isOpenByKeyboard.value;
      }
      return isOpen.value;
    });

    // Submenu title classes
    const titleClasses = computed(() => {
      if (!menuContext) return '';
      return classNames(
        getSubMenuTitleClasses(menuContext.theme, props.disabled),
        props.className,
        coerceClassValue(attrs.class)
      );
    });

    const titleStyle = computed(() =>
      mergeStyleValues(attrs.style, props.style, indentStyle.value)
    );

    const passthroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    // Submenu content classes
    const contentClasses = computed(() => {
      if (!menuContext) return '';

      if (menuContext.mode === 'horizontal') {
        return submenuContentHorizontalClasses;
      }

      if (isPopup.value) return submenuContentPopupClasses;

      if (menuContext.mode === 'inline') return submenuContentInlineClasses;

      return submenuContentVerticalClasses;
    });

    // Handle title click
    const handleTitleClick = () => {
      if (!menuContext || props.disabled) return;
      if (menuContext.mode === 'horizontal') return;

      if (isPopup.value) {
        isOpenByKeyboard.value = !isOpenByKeyboard.value;
        isHovered.value = true;
        return;
      }

      menuContext.handleOpenChange(props.itemKey);
    };

    const getMenuButtonsWithin = (menuEl: HTMLElement) => {
      return Array.from(
        menuEl.querySelectorAll<HTMLButtonElement>(
          'button[data-tiger-menuitem="true"]'
        )
      ).filter((el) => !el.disabled);
    };

    const roveFocus = (current: HTMLButtonElement, next: HTMLButtonElement) => {
      const menuEl = current.closest('ul[role="menu"]') as HTMLElement | null;
      if (!menuEl) {
        next.focus();
        return;
      }

      const items = getMenuButtonsWithin(menuEl);
      items.forEach((el) => {
        el.tabIndex = el === next ? 0 : -1;
      });
      next.focus();
    };

    const moveFocus = (current: HTMLButtonElement, delta: number) => {
      const menuEl = current.closest('ul[role="menu"]') as HTMLElement | null;
      if (!menuEl) return;
      const items = getMenuButtonsWithin(menuEl);
      const currentIndex = items.indexOf(current);
      if (currentIndex < 0) return;
      const nextIndex = (currentIndex + delta + items.length) % items.length;
      roveFocus(current, items[nextIndex]);
    };

    const focusEdge = (current: HTMLButtonElement, edge: 'start' | 'end') => {
      const menuEl = current.closest('ul[role="menu"]') as HTMLElement | null;
      if (!menuEl) return;
      const items = getMenuButtonsWithin(menuEl);
      if (items.length === 0) return;
      roveFocus(current, edge === 'start' ? items[0] : items[items.length - 1]);
    };

    const focusFirstChildItem = async () => {
      await nextTick();
      const titleEl = document.activeElement as HTMLElement | null;
      const li = titleEl?.closest('li');
      const submenu = li?.querySelector(
        'ul[role="menu"]'
      ) as HTMLElement | null;
      if (!submenu) return;
      const items = getMenuButtonsWithin(submenu);
      if (items.length === 0) return;
      items.forEach((el, idx) => {
        el.tabIndex = idx === 0 ? 0 : -1;
      });
      items[0].focus();
    };

    const handleTitleKeyDown = async (event: KeyboardEvent) => {
      if (!menuContext || props.disabled) return;
      const current = event.currentTarget as HTMLButtonElement;

      const rootMenu = current.closest('ul[role="menu"]') as HTMLElement | null;
      const isRoot = rootMenu?.dataset.tigerMenuRoot === 'true';
      const isHorizontalRoot = isRoot && menuContext.mode === 'horizontal';

      const nextKey = isHorizontalRoot ? 'ArrowRight' : 'ArrowDown';
      const prevKey = isHorizontalRoot ? 'ArrowLeft' : 'ArrowUp';

      if (event.key === nextKey) {
        event.preventDefault();
        moveFocus(current, 1);
        return;
      }

      if (event.key === prevKey) {
        event.preventDefault();
        moveFocus(current, -1);
        return;
      }

      if (event.key === 'Home') {
        event.preventDefault();
        focusEdge(current, 'start');
        return;
      }

      if (event.key === 'End') {
        event.preventDefault();
        focusEdge(current, 'end');
        return;
      }

      if (event.key === 'Escape' || event.key === 'ArrowLeft') {
        if (menuContext.mode === 'horizontal' || isPopup.value) {
          event.preventDefault();
          isOpenByKeyboard.value = false;
          isHovered.value = false;
          return;
        }

        if (isOpen.value) {
          event.preventDefault();
          menuContext.handleOpenChange(props.itemKey);
        }
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (menuContext.mode === 'horizontal' || isPopup.value) {
          isOpenByKeyboard.value = true;
          return;
        }
        menuContext.handleOpenChange(props.itemKey);
        await focusFirstChildItem();
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        if (menuContext.mode === 'horizontal' || isPopup.value) {
          event.preventDefault();
          isOpenByKeyboard.value = true;
          return;
        }

        if (!isOpen.value) {
          event.preventDefault();
          menuContext.handleOpenChange(props.itemKey);
          await focusFirstChildItem();
        }
      }
    };

    // Handle mouse enter for horizontal mode
    const handleMouseEnter = () => {
      if (menuContext?.mode === 'horizontal' || isPopup.value) {
        isHovered.value = true;
      }
    };

    // Handle mouse leave for horizontal mode
    const handleMouseLeave = () => {
      if (menuContext?.mode === 'horizontal' || isPopup.value) {
        isHovered.value = false;
        isOpenByKeyboard.value = false;
      }
    };

    // Get indent style for nested menus in inline mode
    const indentStyle = computed(() => {
      if (!menuContext || menuContext.mode !== 'inline' || props.level === 0) {
        return {};
      }
      return getMenuItemIndent(props.level, menuContext.inlineIndent);
    });

    const withChildLevel = (
      nodes: VNode[] | undefined
    ): VNode[] | undefined => {
      if (!nodes || nodes.length === 0) return nodes;
      const nextLevel = props.level + 1;

      return nodes.map((node) => {
        if (!isVNode(node)) return node;
        const type = node.type as unknown;

        const name =
          typeof type === 'object' && type != null && 'name' in type
            ? (type as { name?: unknown }).name
            : undefined;

        const isTarget =
          name === 'TigerMenuItem' ||
          name === 'TigerSubMenu' ||
          name === 'TigerMenuItemGroup';

        if (!isTarget) return node;

        const existingProps =
          ((node.props ?? {}) as Record<string, unknown>) ??
          ({} as Record<string, unknown>);

        const nextProps: Record<string, unknown> = {
          level: existingProps.level ?? nextLevel,
        };

        if (isPopup.value) {
          nextProps.collapsed = false;
        }

        return cloneVNode(node, nextProps);
      });
    };

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
      if (!effectiveCollapsed.value) {
        titleChildren.push(h('span', { class: 'flex-1' }, props.title));

        // Add expand icon
        if (menuContext.mode !== 'horizontal' && !isPopup.value) {
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
        'button',
        {
          type: 'button',
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
          ...passthroughAttrs.value,
        },
        titleChildren
      );

      // Render submenu content
      const contentNode =
        menuContext.mode === 'horizontal' || isPopup.value
          ? h(
              'ul',
              {
                class: contentClasses.value,
                style: {
                  display: isExpanded.value ? 'block' : 'none',
                },
                role: 'menu',
                'aria-hidden': isExpanded.value ? undefined : 'true',
              },
              withChildLevel(slots.default?.() as VNode[] | undefined)
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
                        withChildLevel(slots.default?.() as VNode[] | undefined)
                      )
                    : null,
              }
            );

      return h(
        'li',
        {
          class:
            menuContext.mode === 'horizontal' || isPopup.value
              ? 'relative'
              : '',
          onMouseenter: handleMouseEnter,
          onMouseleave: handleMouseLeave,
          role: 'none',
        },
        [titleNode, contentNode]
      );
    };
  },
});

export default SubMenu;

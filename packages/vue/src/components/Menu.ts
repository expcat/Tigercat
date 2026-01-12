import {
  defineComponent,
  computed,
  ref,
  provide,
  PropType,
  h,
  type ComputedRef,
} from "vue";
import {
  classNames,
  coerceClassValue,
  getMenuClasses,
  mergeStyleValues,
  type MenuMode,
  type MenuTheme,
  type MenuKey,
  type MenuProps as CoreMenuProps,
  replaceKeys,
  toggleKey,
} from "@tigercat/core";

// Menu context key
export const MenuContextKey = Symbol("MenuContext");

// Menu context interface
export interface MenuContext {
  mode: MenuMode;
  theme: MenuTheme;
  collapsed: boolean;
  inlineIndent: number;
  selectedKeys: ComputedRef<MenuKey[]>;
  openKeys: ComputedRef<MenuKey[]>;
  handleSelect: (key: string | number) => void;
  handleOpenChange: (key: string | number) => void;
}

export interface VueMenuProps {
  mode?: MenuMode;
  theme?: MenuTheme;
  selectedKeys?: MenuKey[];
  defaultSelectedKeys?: MenuKey[];
  openKeys?: MenuKey[];
  defaultOpenKeys?: MenuKey[];
  collapsed?: boolean;
  multiple?: boolean;
  inlineIndent?: number;
  className?: string;
  style?: CoreMenuProps["style"];
}

export const Menu = defineComponent({
  name: "TigerMenu",
  inheritAttrs: false,
  props: {
    /**
     * Menu mode - horizontal, vertical, or inline
     * @default 'vertical'
     */
    mode: {
      type: String as PropType<MenuMode>,
      default: "vertical" as MenuMode,
    },
    /**
     * Menu theme - light or dark
     * @default 'light'
     */
    theme: {
      type: String as PropType<MenuTheme>,
      default: "light" as MenuTheme,
    },
    /**
     * Currently selected menu item keys
     */
    selectedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: undefined,
    },
    /**
     * Default selected menu item keys
     */
    defaultSelectedKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => [],
    },
    /**
     * Currently opened submenu keys (for vertical/inline mode)
     */
    openKeys: {
      type: Array as PropType<(string | number)[]>,
      default: undefined,
    },
    /**
     * Default opened submenu keys
     */
    defaultOpenKeys: {
      type: Array as PropType<(string | number)[]>,
      default: () => [],
    },
    /**
     * Whether the menu is collapsed (for vertical mode)
     * @default false
     */
    collapsed: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether multiple submenus can be opened at once
     * @default true
     */
    multiple: {
      type: Boolean,
      default: true,
    },
    /**
     * Inline indentation for submenu items
     * @default 24
     */
    inlineIndent: {
      type: Number,
      default: 24,
    },
    className: {
      type: String,
      default: undefined,
    },
    style: {
      type: Object as PropType<CoreMenuProps["style"]>,
      default: undefined,
    },
  },
  emits: ["update:selectedKeys", "update:openKeys", "select", "open-change"],
  setup(props, { slots, emit, attrs }) {
    // Internal state for uncontrolled mode
    const internalSelectedKeys = ref<MenuKey[]>(props.defaultSelectedKeys);
    const internalOpenKeys = ref<MenuKey[]>(props.defaultOpenKeys);

    // Computed selected keys (controlled or uncontrolled)
    const currentSelectedKeys = computed(() => {
      return props.selectedKeys !== undefined
        ? props.selectedKeys
        : internalSelectedKeys.value;
    });

    // Computed open keys (controlled or uncontrolled)
    const currentOpenKeys = computed(() => {
      return props.openKeys !== undefined
        ? props.openKeys
        : internalOpenKeys.value;
    });

    // Handle menu item selection
    const handleSelect = (key: string | number) => {
      const newSelectedKeys = replaceKeys(key, currentSelectedKeys.value);

      // Update internal state if uncontrolled
      if (props.selectedKeys === undefined) {
        internalSelectedKeys.value = newSelectedKeys;
      }

      // Emit events
      emit("update:selectedKeys", newSelectedKeys);
      emit("select", key, { selectedKeys: newSelectedKeys });
    };

    // Handle submenu open/close
    const handleOpenChange = (key: string | number) => {
      const toggled = toggleKey(key, currentOpenKeys.value);
      const newOpenKeys = props.multiple
        ? toggled
        : toggled.includes(key)
        ? [key]
        : [];

      // Update internal state if uncontrolled
      if (props.openKeys === undefined) {
        internalOpenKeys.value = newOpenKeys;
      }

      // Emit events
      emit("update:openKeys", newOpenKeys);
      emit("open-change", key, { openKeys: newOpenKeys });
    };

    // Menu classes
    const menuClasses = computed(() => {
      return classNames(
        getMenuClasses(props.mode, props.theme, props.collapsed),
        props.className,
        coerceClassValue(attrs.class)
      );
    });

    const menuStyle = computed(() =>
      mergeStyleValues(attrs.style, props.style)
    );

    const passthroughAttrs = computed(() => {
      const { class: _class, style: _style, ...rest } = attrs;
      return rest;
    });

    // Provide menu context to child components
    provide<MenuContext>(MenuContextKey, {
      mode: props.mode,
      theme: props.theme,
      collapsed: props.collapsed,
      inlineIndent: props.inlineIndent,
      selectedKeys: currentSelectedKeys,
      openKeys: currentOpenKeys,
      handleSelect,
      handleOpenChange,
    });

    return () => {
      return h(
        "ul",
        {
          class: menuClasses.value,
          style: menuStyle.value,
          role: "menu",
          ...passthroughAttrs.value,
        },
        slots.default?.()
      );
    };
  },
});

export default Menu;

import {
  defineComponent,
  computed,
  ref,
  provide,
  PropType,
  h,
  reactive,
  watch,
  getCurrentInstance,
  type VNode,
  type VNodeArrayChildren,
  type Component,
} from "vue";
import {
  classNames,
  getTabsContainerClasses,
  getTabNavClasses,
  getTabNavListClasses,
  tabAddButtonClasses,
  tabContentBaseClasses,
  type TabType,
  type TabPosition,
  type TabSize,
} from "@tigercat/core";

// Tabs context key
export const TabsContextKey = Symbol("TabsContext");

// Tabs context interface
export interface TabsContext {
  activeKey: string | number | undefined;
  type: TabType;
  size: TabSize;
  tabPosition: TabPosition;
  closable: boolean;
  destroyInactiveTabPane: boolean;
  idBase: string;
  handleTabClick: (key: string | number) => void;
  handleTabClose: (key: string | number, event: Event) => void;
}

export interface VueTabsProps {
  activeKey?: string | number;
  defaultActiveKey?: string | number;
  type?: TabType;
  tabPosition?: TabPosition;
  size?: TabSize;
  closable?: boolean;
  centered?: boolean;
  destroyInactiveTabPane?: boolean;
  className?: string;
  style?: Record<string, string | number>;
}

type RawChildren =
  | string
  | number
  | boolean
  | VNode
  | VNodeArrayChildren
  | (() => unknown);
type RawSlotsLike = { [name: string]: unknown; $stable?: boolean };

export const Tabs = defineComponent({
  name: "TigerTabs",
  props: {
    /**
     * Currently active tab key
     */
    activeKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    /**
     * Default active tab key (for uncontrolled mode)
     */
    defaultActiveKey: {
      type: [String, Number] as PropType<string | number>,
      default: undefined,
    },
    /**
     * Tab type - line, card, or editable-card
     * @default 'line'
     */
    type: {
      type: String as PropType<TabType>,
      default: "line" as TabType,
    },
    /**
     * Tab position - top, bottom, left, or right
     * @default 'top'
     */
    tabPosition: {
      type: String as PropType<TabPosition>,
      default: "top" as TabPosition,
    },
    /**
     * Tab size - small, medium, or large
     * @default 'medium'
     */
    size: {
      type: String as PropType<TabSize>,
      default: "medium" as TabSize,
    },
    /**
     * Whether tabs can be closed (only works with editable-card type)
     * @default false
     */
    closable: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether tabs are centered
     * @default false
     */
    centered: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether to destroy inactive tab panes
     * @default false
     */
    destroyInactiveTabPane: {
      type: Boolean,
      default: false,
    },
    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined,
    },
    /**
     * Custom styles
     */
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined,
    },
  },
  emits: ["update:activeKey", "change", "edit", "tab-click"],
  setup(props, { slots, emit }) {
    const instance = getCurrentInstance();
    const idBase = `tiger-tabs-${instance?.uid ?? "0"}`;

    // Internal state for uncontrolled mode
    const internalActiveKey = ref<string | number | undefined>(
      props.defaultActiveKey
    );

    // Computed active key (controlled or uncontrolled)
    const currentActiveKey = computed(() => {
      return props.activeKey !== undefined
        ? props.activeKey
        : internalActiveKey.value;
    });

    // Handle tab click
    const handleTabClick = (key: string | number) => {
      emit("tab-click", key);

      const prevKey = currentActiveKey.value;

      if (prevKey === key) {
        return;
      }

      // Update internal state if uncontrolled
      if (props.activeKey === undefined) {
        internalActiveKey.value = key;
      }

      // Emit events only when switching
      emit("update:activeKey", key);
      emit("change", key);
    };

    // Handle tab close
    const handleTabClose = (key: string | number, event: Event) => {
      event.stopPropagation();

      // Emit edit event
      emit("edit", { targetKey: key, action: "remove" });
    };

    // Container classes
    const containerClasses = computed(() => {
      return classNames(
        getTabsContainerClasses(props.tabPosition),
        props.className
      );
    });

    // Tab nav classes
    const tabNavClasses = computed(() => {
      return getTabNavClasses(props.tabPosition, props.type);
    });

    // Tab nav list classes
    const tabNavListClasses = computed(() => {
      return getTabNavListClasses(props.tabPosition, props.centered);
    });

    // Tab content classes
    const tabContentClasses = computed(() => {
      return tabContentBaseClasses;
    });

    // Provide tabs context to child components (make it reactive)
    const tabsContextValue = reactive<TabsContext>({
      activeKey: currentActiveKey.value,
      type: props.type,
      size: props.size,
      tabPosition: props.tabPosition,
      closable: props.closable,
      destroyInactiveTabPane: props.destroyInactiveTabPane,
      idBase,
      handleTabClick,
      handleTabClose,
    });

    watch(currentActiveKey, (newKey) => {
      tabsContextValue.activeKey = newKey;
    });

    watch(
      () => props.type,
      (newType) => {
        tabsContextValue.type = newType;
      }
    );

    watch(
      () => props.tabPosition,
      (newPos) => {
        tabsContextValue.tabPosition = newPos;
      }
    );

    watch(
      () => props.size,
      (newSize) => {
        tabsContextValue.size = newSize;
      }
    );

    watch(
      () => props.closable,
      (newClosable) => {
        tabsContextValue.closable = newClosable;
      }
    );

    watch(
      () => props.destroyInactiveTabPane,
      (newDestroy) => {
        tabsContextValue.destroyInactiveTabPane = newDestroy;
      }
    );

    provide<TabsContext>(TabsContextKey, tabsContextValue);

    return () => {
      const children = (slots.default?.() || []) as VNode[];

      // Extract tab items (for nav) and tab panes (for content)
      const tabItems: VNode[] = [];
      const tabPanes: VNode[] = [];
      let firstTabKey: string | number | undefined;

      children.forEach((child) => {
        const childType = child?.type;
        const childName =
          typeof childType === "object" && childType && "name" in childType
            ? (childType as { name?: string }).name
            : undefined;

        if (childName === "TigerTabPane") {
          const childProps = (child.props ?? {}) as Record<string, unknown>;

          if (firstTabKey === undefined) {
            const k = childProps.tabKey;
            if (typeof k === "string" || typeof k === "number") {
              firstTabKey = k;
            }
          }
          // `VNode.type` is `VNodeTypes` but `h()` expects `string | Component` here.
          // Narrow to keep DTS generation happy.
          const tabPaneType =
            typeof child.type === "string" || typeof child.type === "object"
              ? (child.type as string | Component)
              : "div";

          // Store both the tab item and pane components
          // Pass the original child for tab rendering
          const resolvedActiveKey =
            props.activeKey ??
            internalActiveKey.value ??
            props.defaultActiveKey ??
            firstTabKey;

          const tabId = `${idBase}-tab-${String(childProps.tabKey ?? "")}`;
          const panelId = `${idBase}-panel-${String(childProps.tabKey ?? "")}`;

          tabItems.push(
            h(tabPaneType, {
              ...childProps,
              renderMode: "tab",
              tabId,
              panelId,
              tabIndex: childProps.tabKey === resolvedActiveKey ? 0 : -1,
            })
          );
          // Pass the child with its children/slots for pane rendering
          tabPanes.push(
            h(
              tabPaneType,
              {
                ...childProps,
                renderMode: "pane",
                tabId,
                panelId,
              },
              (child.children ?? undefined) as unknown as
                | RawChildren
                | RawSlotsLike
            )
          );
        }
      });

      if (
        props.activeKey === undefined &&
        internalActiveKey.value === undefined &&
        firstTabKey !== undefined
      ) {
        internalActiveKey.value = firstTabKey;
        tabsContextValue.activeKey = firstTabKey;
      }

      // Render tab nav
      const tabNavContent = h(
        "div",
        {
          class: tabNavClasses.value,
          role: "tablist",
          "aria-orientation":
            props.tabPosition === "left" || props.tabPosition === "right"
              ? "vertical"
              : "horizontal",
        },
        [
          h(
            "div",
            {
              class: tabNavListClasses.value,
            },
            [
              ...tabItems,
              props.type === "editable-card"
                ? h(
                    "button",
                    {
                      type: "button",
                      class: tabAddButtonClasses,
                      onClick: () =>
                        emit("edit", { targetKey: undefined, action: "add" }),
                      "aria-label": "Add tab",
                    },
                    "+"
                  )
                : null,
            ]
          ),
        ]
      );

      // Render tab content
      const tabContent = h(
        "div",
        {
          class: tabContentClasses.value,
        },
        tabPanes
      );

      // For left/right position, we need different layout
      if (props.tabPosition === "left" || props.tabPosition === "right") {
        return h(
          "div",
          {
            class: containerClasses.value,
          },
          [tabNavContent, tabContent]
        );
      }

      // For top/bottom position
      return h(
        "div",
        {
          class: containerClasses.value,
          style: props.style,
        },
        props.tabPosition === "bottom"
          ? [tabContent, tabNavContent]
          : [tabNavContent, tabContent]
      );
    };
  },
});

export default Tabs;

import { defineComponent, h, type PropType } from "vue";
import { menuItemGroupTitleClasses } from "@tigercat/core";

export interface VueMenuItemGroupProps {
  title?: string;
  className?: string;
  style?: Record<string, string | number>;
}

export const MenuItemGroup = defineComponent({
  name: "TigerMenuItemGroup",
  inheritAttrs: false,
  props: {
    /**
     * Group title
     */
    title: {
      type: String,
      default: "",
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
    return () => {
      const children = [];

      // Render group title
      if (props.title) {
        children.push(
          h("div", { class: menuItemGroupTitleClasses }, props.title)
        );
      }

      // Render group items
      if (slots.default) {
        children.push(
          h(
            "ul",
            {
              role: "group",
              class: props.className || attrs.class,
              style: props.style || attrs.style,
            },
            slots.default()
          )
        );
      }

      return h("li", { class: "list-none" }, children);
    };
  },
});

export default MenuItemGroup;

import { defineComponent, h } from 'vue'
import { menuItemGroupTitleClasses } from '@tigercat/core'

export const MenuItemGroup = defineComponent({
  name: 'TigerMenuItemGroup',
  props: {
    /**
     * Group title
     */
    title: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    return () => {
      const children = []

      // Render group title
      if (props.title) {
        children.push(
          h('div', { class: menuItemGroupTitleClasses }, props.title)
        )
      }

      // Render group items
      if (slots.default) {
        children.push(h('ul', { role: 'group' }, slots.default()))
      }

      return h('li', { class: 'list-none' }, children)
    }
  },
})

export default MenuItemGroup

import { defineComponent, h, provide, PropType } from 'vue'
import {
  coerceClassValue,
  getAvatarGroupClasses,
  getAvatarGroupItemClasses,
  getAvatarGroupOverflowClasses,
  getAvatarGroupOverflowLabel,
  getAvatarGroupOverflowText,
  getVisibleGroupItems,
  type AvatarSize
} from '@expcat/tigercat-core'

export const AVATAR_GROUP_INJECTION_KEY = Symbol('TigerAvatarGroup')

export interface AvatarGroupContext {
  size?: AvatarSize
  itemClass: string
}

export interface VueAvatarGroupProps {
  max?: number
  size?: AvatarSize
  className?: string
}

export const AvatarGroup = defineComponent({
  name: 'TigerAvatarGroup',
  inheritAttrs: false,
  props: {
    max: {
      type: Number,
      default: undefined
    },
    size: {
      type: String as PropType<AvatarSize>,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    provide<AvatarGroupContext>(AVATAR_GROUP_INJECTION_KEY, {
      size: props.size,
      itemClass: getAvatarGroupItemClasses()
    })

    return () => {
      const children = slots.default?.() ?? []
      const flatChildren = children.flatMap((vnode) =>
        Array.isArray(vnode.children) ? vnode.children : [vnode]
      )

      const attrsRecord = attrs as Record<string, unknown>
      const attrsClass = attrsRecord.class

      const { visibleItems, overflowCount } = getVisibleGroupItems(flatChildren, props.max)

      return h(
        'div',
        {
          ...attrs,
          class: getAvatarGroupClasses(props.className, coerceClassValue(attrsClass)),
          role: 'group',
          'aria-label': 'Avatar group'
        },
        [
          ...visibleItems,
          overflowCount > 0
            ? h(
                'span',
                {
                  class: getAvatarGroupOverflowClasses(props.size ?? 'md'),
                  'aria-label': getAvatarGroupOverflowLabel(overflowCount)
                },
                getAvatarGroupOverflowText(overflowCount)
              )
            : null
        ]
      )
    }
  }
})

export default AvatarGroup

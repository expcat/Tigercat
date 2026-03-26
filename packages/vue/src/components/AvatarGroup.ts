import { defineComponent, computed, h, provide, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  avatarGroupBaseClasses,
  avatarGroupItemClasses,
  avatarGroupOverflowClasses,
  avatarSizeClasses,
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
      itemClass: avatarGroupItemClasses
    })

    const overflowSizeClass = computed(() => avatarSizeClasses[props.size ?? 'md'])

    return () => {
      const children = slots.default?.() ?? []
      const flatChildren = children.flatMap((vnode) =>
        Array.isArray(vnode.children) ? vnode.children : [vnode]
      )

      const attrsRecord = attrs as Record<string, unknown>
      const attrsClass = attrsRecord.class

      const total = flatChildren.length
      const visibleCount = props.max != null && props.max < total ? props.max : total
      const overflow = total - visibleCount

      const visible = flatChildren.slice(0, visibleCount)

      return h(
        'div',
        {
          ...attrs,
          class: classNames(avatarGroupBaseClasses, props.className, coerceClassValue(attrsClass)),
          role: 'group',
          'aria-label': 'Avatar group'
        },
        [
          ...visible,
          overflow > 0
            ? h(
                'span',
                {
                  class: classNames(avatarGroupOverflowClasses, overflowSizeClass.value),
                  'aria-label': `${overflow} more`
                },
                `+${overflow}`
              )
            : null
        ]
      )
    }
  }
})

export default AvatarGroup

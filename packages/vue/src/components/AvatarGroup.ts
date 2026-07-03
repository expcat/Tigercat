import { computed, defineComponent, h, provide, reactive, watch, PropType } from 'vue'
import {
  coerceClassValue,
  getAvatarGroupClasses,
  getAvatarGroupItemClasses,
  getAvatarGroupLabels,
  getAvatarGroupOverflowClasses,
  getAvatarGroupOverflowLabel,
  getAvatarGroupOverflowText,
  getVisibleGroupItems,
  mergeTigerLocale,
  type AvatarSize,
  type TigerLocale,
  type TigerLocaleAvatarGroup
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export const AVATAR_GROUP_INJECTION_KEY = Symbol('TigerAvatarGroup')

export interface AvatarGroupContext {
  size?: AvatarSize
  itemClass: string
}

export interface VueAvatarGroupProps {
  max?: number
  size?: AvatarSize
  className?: string
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleAvatarGroup>
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
    },
    /** Locale overrides merged on top of ConfigProvider locale */
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    /** Text/aria label overrides */
    labels: {
      type: Object as PropType<Partial<TigerLocaleAvatarGroup>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getAvatarGroupLabels(mergedLocale.value, props.labels))

    // Provide a reactive context so child Avatars follow dynamic `size` changes
    const groupContext = reactive<AvatarGroupContext>({
      size: props.size,
      itemClass: getAvatarGroupItemClasses()
    })
    watch(
      () => props.size,
      (size) => {
        groupContext.size = size
      }
    )
    provide(AVATAR_GROUP_INJECTION_KEY, groupContext)

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
          role: 'group',
          'aria-label': labels.value.ariaLabel,
          ...attrs,
          class: getAvatarGroupClasses(props.className, coerceClassValue(attrsClass))
        },
        [
          ...visibleItems,
          overflowCount > 0
            ? h(
                'span',
                {
                  class: getAvatarGroupOverflowClasses(props.size ?? 'md'),
                  'aria-label': getAvatarGroupOverflowLabel(
                    overflowCount,
                    labels.value.overflowAriaLabel
                  )
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

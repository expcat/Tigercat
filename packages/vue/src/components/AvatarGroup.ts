import { computed, defineComponent, h, provide, reactive, watch, PropType, Text } from 'vue'
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
  type AvatarShape,
  type AvatarSize,
  type TigerLocale,
  type TigerLocaleAvatarGroup
} from '@expcat/tigercat-core'
import { flattenSlotVNodes } from '../utils/flatten-vnodes'
import { useTigerConfig } from './ConfigProvider'

export const AVATAR_GROUP_INJECTION_KEY = Symbol('TigerAvatarGroup')

export interface AvatarGroupContext {
  size?: AvatarSize
  shape?: AvatarShape
  itemClass: string
}

export interface VueAvatarGroupProps {
  max?: number
  size?: AvatarSize
  shape?: AvatarShape
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
    shape: {
      type: String as PropType<AvatarShape>,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleAvatarGroup>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getAvatarGroupLabels(mergedLocale.value, props.labels))

    const groupContext = reactive<AvatarGroupContext>({
      size: props.size,
      shape: props.shape,
      itemClass: getAvatarGroupItemClasses()
    })
    watch(
      () => [props.size, props.shape] as const,
      ([size, shape]) => {
        groupContext.size = size
        groupContext.shape = shape
      }
    )
    provide(AVATAR_GROUP_INJECTION_KEY, groupContext)

    return () => {
      const avatars = flattenSlotVNodes(slots.default?.()).filter((child) => {
        if (child.type === Text) return false
        const type = child.type as { name?: string } | string
        return typeof type === 'object' && type?.name === 'TigerAvatar'
      })
      const attrsRecord = attrs as Record<string, unknown>
      const attrsClass = attrsRecord.class
      const { visibleItems, overflowCount, visibleCount } = getVisibleGroupItems(avatars, props.max)
      const overflowShape = props.shape ?? 'circle'

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
                  class: getAvatarGroupOverflowClasses(
                    props.size ?? 'md',
                    overflowShape,
                    visibleCount > 0
                  ),
                  role: 'img',
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

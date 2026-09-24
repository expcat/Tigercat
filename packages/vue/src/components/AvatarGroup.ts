import { computed, defineComponent, h, provide, reactive, ref, watch, PropType, Text, type VNode } from 'vue'
import {
  coerceClassValue,
  getAvatarGroupClasses,
  getAvatarGroupItemClasses,
  getAvatarGroupLabels,
  getAvatarGroupOverflowClasses,
  getAvatarGroupOverflowLabel,
  getAvatarGroupOverflowText,
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

    const expanded = ref(false)

    return () => {
      const nodes = flattenSlotVNodes(slots.default?.())
      const cap =
        typeof props.max === 'number' && Number.isFinite(props.max)
          ? Math.max(0, Math.floor(props.max))
          : undefined
      let avatarSeen = 0
      let overflowCount = 0
      const rendered: VNode[] = []
      nodes.forEach((child, index) => {
        if (child.type === Text) return
        const type = child.type as { name?: string } | string
        const isAvatar = typeof type === 'object' && type?.name === 'TigerAvatar'
        if (!isAvatar) {
          rendered.push(child)
          return
        }
        const hidden = cap != null && !expanded.value && avatarSeen >= cap
        if (cap != null && avatarSeen >= cap) overflowCount += 1
        avatarSeen += 1
        rendered.push(hidden ? h('span', { key: index, class: 'sr-only' }, [child]) : child)
      })
      const attrsRecord = attrs as Record<string, unknown>
      const attrsClass = attrsRecord.class
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
          ...rendered,
          overflowCount > 0 && !expanded.value
            ? h(
                'button',
                {
                  type: 'button',
                  class: getAvatarGroupOverflowClasses(
                    props.size ?? 'md',
                    overflowShape,
                    avatarSeen > overflowCount
                  ),
                  'aria-expanded': 'false',
                  'aria-label': getAvatarGroupOverflowLabel(
                    overflowCount,
                    labels.value.overflowAriaLabel
                  ),
                  onClick: () => {
                    expanded.value = true
                  }
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

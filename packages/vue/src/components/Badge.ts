import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getBadgeVariantClasses,
  badgeBaseClasses,
  badgeSizeClasses,
  dotSizeClasses,
  badgeTypeClasses,
  badgeWrapperClasses,
  badgePositionClasses,
  formatBadgeContent,
  shouldHideBadge,
  type BadgeProps,
  type BadgeVariant,
  type BadgeSize,
  type BadgeType,
  type BadgePosition
} from '@expcat/tigercat-core'

export interface VueBadgeProps extends BadgeProps {
  style?: Record<string, string | number>
}

export const Badge = defineComponent({
  name: 'TigerBadge',
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<BadgeVariant>,
      default: 'danger'
    },
    size: {
      type: String as PropType<BadgeSize>,
      default: 'md'
    },
    type: {
      type: String as PropType<BadgeType>,
      default: 'number'
    },
    content: {
      type: [Number, String] as PropType<number | string>,
      default: undefined
    },
    max: {
      type: Number,
      default: 99
    },
    showZero: {
      type: Boolean,
      default: false
    },
    position: {
      type: String as PropType<BadgePosition>,
      default: 'top-right'
    },
    standalone: {
      type: Boolean,
      default: true
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, string | number>>,
      default: undefined
    }
  },
  setup(props, { slots, attrs }) {
    const isDot = computed(() => props.type === 'dot')
    const isHidden = computed(() => shouldHideBadge(props.content, props.type, props.showZero))
    const displayContent = computed(() =>
      formatBadgeContent(props.content, props.max, props.showZero)
    )

    const badgeClasses = computed(() =>
      classNames(
        badgeBaseClasses,
        getBadgeVariantClasses(props.variant),
        isDot.value ? dotSizeClasses[props.size] : badgeSizeClasses[props.size],
        badgeTypeClasses[props.type],
        !props.standalone && badgePositionClasses[props.position]
      )
    )

    return () => {
      if (isHidden.value) {
        return props.standalone ? null : (slots.default?.() ?? null)
      }

      const attrsRecord = attrs as Record<string, unknown>
      const ariaLabel =
        (attrsRecord['aria-label'] as string | undefined) ??
        (isDot.value
          ? 'notification'
          : props.type === 'number'
            ? `${displayContent.value} notifications`
            : `${displayContent.value ?? ''}`)

      const badgeElement = h(
        'span',
        {
          ...attrs,
          class: classNames(
            badgeClasses.value,
            props.className,
            coerceClassValue(attrsRecord.class)
          ),
          style: mergeStyleValues(attrsRecord.style, props.style),
          role: 'status',
          'aria-label': ariaLabel
        },
        isDot.value ? undefined : displayContent.value || ''
      )

      if (props.standalone) {
        return badgeElement
      }

      return h('span', { class: badgeWrapperClasses }, [...(slots.default?.() ?? []), badgeElement])
    }
  }
})

export default Badge

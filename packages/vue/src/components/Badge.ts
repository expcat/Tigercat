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
  type BadgeVariant,
  type BadgeSize,
  type BadgeType,
  type BadgePosition
} from '@expcat/tigercat-core'

export interface VueBadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  type?: BadgeType
  content?: number | string
  max?: number
  showZero?: boolean
  position?: BadgePosition
  standalone?: boolean
  className?: string
  style?: Record<string, string | number>
}

export const Badge = defineComponent({
  name: 'TigerBadge',
  inheritAttrs: false,
  props: {
    /**
     * Badge variant style
     * @default 'danger'
     */
    variant: {
      type: String as PropType<BadgeVariant>,
      default: 'danger' as BadgeVariant
    },
    /**
     * Badge size
     * @default 'md'
     */
    size: {
      type: String as PropType<BadgeSize>,
      default: 'md' as BadgeSize
    },
    /**
     * Badge display type
     * @default 'number'
     */
    type: {
      type: String as PropType<BadgeType>,
      default: 'number' as BadgeType
    },
    /**
     * Badge content (number or text)
     */
    content: {
      type: [Number, String] as PropType<number | string>,
      default: undefined
    },
    /**
     * Maximum count to display (only for type='number')
     * @default 99
     */
    max: {
      type: Number,
      default: 99
    },
    /**
     * Whether to show zero count
     * @default false
     */
    showZero: {
      type: Boolean,
      default: false
    },
    /**
     * Badge position when used as wrapper
     * @default 'top-right'
     */
    position: {
      type: String as PropType<BadgePosition>,
      default: 'top-right' as BadgePosition
    },
    /**
     * Whether badge is standalone or wrapping content
     * @default true
     */
    standalone: {
      type: Boolean,
      default: true
    },

    /**
     * Additional CSS classes
     */
    className: {
      type: String,
      default: undefined
    },

    /**
     * Custom styles
     */
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

    const badgeClasses = computed(() => {
      const sizeClass = isDot.value ? dotSizeClasses[props.size] : badgeSizeClasses[props.size]

      return classNames(
        badgeBaseClasses,
        getBadgeVariantClasses(props.variant),
        sizeClass,
        badgeTypeClasses[props.type],
        !props.standalone && badgePositionClasses[props.position]
      )
    })

    return () => {
      // If badge should be hidden, render only children (or nothing if standalone)
      if (isHidden.value) {
        if (props.standalone) {
          return null
        }
        return slots.default ? slots.default() : null
      }

      // Create badge element
      const attrsRecord = attrs as Record<string, unknown>
      const attrsClass = attrsRecord.class
      const attrsStyle = attrsRecord.style
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
          class: classNames(badgeClasses.value, props.className, coerceClassValue(attrsClass)),
          style: mergeStyleValues(attrsStyle, props.style),
          role: 'status',
          'aria-label': ariaLabel
        },
        isDot.value ? undefined : displayContent.value || ''
      )

      // If standalone, return badge only
      if (props.standalone) {
        return badgeElement
      }

      // If wrapping content, return wrapper with badge and children
      const children = []
      if (slots.default) {
        children.push(...slots.default())
      }
      children.push(badgeElement)

      return h(
        'span',
        {
          class: badgeWrapperClasses
        },
        children
      )
    }
  }
})

export default Badge

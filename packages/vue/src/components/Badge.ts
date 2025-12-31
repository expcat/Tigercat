import { defineComponent, computed, h, PropType } from 'vue'
import { 
  classNames, 
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
  type BadgePosition,
} from '@tigercat/core'

export const Badge = defineComponent({
  name: 'TigerBadge',
  props: {
    /**
     * Badge variant style
     * @default 'danger'
     */
    variant: {
      type: String as PropType<BadgeVariant>,
      default: 'danger' as BadgeVariant,
    },
    /**
     * Badge size
     * @default 'md'
     */
    size: {
      type: String as PropType<BadgeSize>,
      default: 'md' as BadgeSize,
    },
    /**
     * Badge display type
     * @default 'number'
     */
    type: {
      type: String as PropType<BadgeType>,
      default: 'number' as BadgeType,
    },
    /**
     * Badge content (number or text)
     */
    content: {
      type: [Number, String] as PropType<number | string>,
      default: undefined,
    },
    /**
     * Maximum count to display (only for type='number')
     * @default 99
     */
    max: {
      type: Number,
      default: 99,
    },
    /**
     * Whether to show zero count
     * @default false
     */
    showZero: {
      type: Boolean,
      default: false,
    },
    /**
     * Badge position when used as wrapper
     * @default 'top-right'
     */
    position: {
      type: String as PropType<BadgePosition>,
      default: 'top-right' as BadgePosition,
    },
    /**
     * Whether badge is standalone or wrapping content
     * @default true
     */
    standalone: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    const isDot = computed(() => props.type === 'dot')
    const isHidden = computed(() => shouldHideBadge(props.content, props.type, props.showZero))
    const displayContent = computed(() => formatBadgeContent(props.content, props.max, props.showZero))

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
      const badgeElement = h(
        'span',
        {
          class: badgeClasses.value,
          role: 'status',
          'aria-label': isDot.value ? 'notification' : `${displayContent.value} notifications`,
        },
        isDot.value ? undefined : (displayContent.value || '')
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
          class: badgeWrapperClasses,
        },
        children
      )
    }
  },
})

export default Badge

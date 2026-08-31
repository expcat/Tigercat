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
  resolveBadgeContent,
  warnStandaloneBadgeChildren,
  type BadgeProps,
  type BadgeVariant,
  type BadgeSize,
  type BadgeType,
  type BadgePosition,
  type TigerLocale
} from '@expcat/tigercat-core'

export interface VueBadgeProps extends BadgeProps {
  style?: Record<string, string | number>
}

export const Badge = defineComponent({
  name: 'TigerBadge',
  inheritAttrs: false,
  props: {
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
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
    const resolved = computed(() =>
      resolveBadgeContent({
        type: props.type,
        content: props.content,
        max: props.max,
        showZero: props.showZero
      })
    )
    const isDot = computed(() => resolved.value.kind === 'dot')
    const isHidden = computed(() => resolved.value.kind === 'hidden')

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
      const defaultSlot = slots.default?.() ?? []
      warnStandaloneBadgeChildren(defaultSlot.length > 0, props.standalone)

      const attrsRecord = attrs as Record<string, unknown>
      const ariaLabel = attrsRecord['aria-label'] as string | undefined
      const ariaLabelledby = attrsRecord['aria-labelledby'] as string | undefined
      const ariaHidden = attrsRecord['aria-hidden'] as boolean | string | undefined
      const userNamed = Boolean(ariaLabel || ariaLabelledby)
      const hideFromAT = ariaHidden ?? (!userNamed && (isDot.value || !props.standalone))

      const {
        class: attrsClass,
        style: attrsStyle,
        'aria-label': _ariaLabel,
        'aria-labelledby': _ariaLabelledby,
        'aria-hidden': _ariaHidden,
        ...restAttrs
      } = attrsRecord

      const badgeElement = isHidden.value
        ? null
        : h(
            'span',
            {
              ...(props.standalone ? restAttrs : undefined),
              class: classNames(
                badgeClasses.value,
                props.standalone && props.className,
                props.standalone && coerceClassValue(attrsClass)
              ),
              style: props.standalone ? mergeStyleValues(attrsStyle, props.style) : undefined,
              'aria-hidden': hideFromAT ? true : ariaHidden,
              'aria-label': hideFromAT ? undefined : ariaLabel,
              'aria-labelledby': hideFromAT ? undefined : ariaLabelledby
            },
            resolved.value.kind === 'text' ? resolved.value.value : undefined
          )

      if (props.standalone) {
        return badgeElement
      }

      return h(
        'span',
        {
          ...restAttrs,
          class: classNames(badgeWrapperClasses, props.className, coerceClassValue(attrsClass)),
          style: mergeStyleValues(attrsStyle, props.style)
        },
        [...defaultSlot, badgeElement]
      )
    }
  }
})

export default Badge

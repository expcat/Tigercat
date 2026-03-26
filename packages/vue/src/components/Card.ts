import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getCardClasses,
  cardSizeClasses,
  cardHeaderClasses,
  cardFooterClasses,
  cardCoverWrapperClasses,
  cardCoverClasses,
  cardActionsClasses,
  cardDirectionClasses,
  cardHorizontalBodyClasses,
  type CardVariant,
  type CardSize,
  type CardDirection
} from '@expcat/tigercat-core'

export interface VueCardProps {
  variant?: CardVariant
  size?: CardSize
  direction?: CardDirection
  hoverable?: boolean
  cover?: string
  coverAlt?: string
  className?: string
  style?: Record<string, string | number>
}

export const Card = defineComponent({
  name: 'TigerCard',
  inheritAttrs: false,
  props: {
    /**
     * Card variant style
     * @default 'default'
     */
    variant: {
      type: String as PropType<CardVariant>,
      default: 'default' as CardVariant
    },
    /**
     * Card size (affects padding)
     * @default 'md'
     */
    size: {
      type: String as PropType<CardSize>,
      default: 'md' as CardSize
    },
    /**
     * Whether the card is hoverable (shows hover effect)
     * @default false
     */
    hoverable: {
      type: Boolean,
      default: false
    },
    /**
     * Card layout direction
     * @default 'vertical'
     */
    direction: {
      type: String as PropType<CardDirection>,
      default: 'vertical' as CardDirection
    },
    /**
     * Cover image URL
     */
    cover: {
      type: String,
      default: undefined
    },
    /**
     * Cover image alt text
     */
    coverAlt: {
      type: String,
      default: 'Card cover image'
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
    const cardClasses = computed(() =>
      classNames(
        getCardClasses(props.variant, props.hoverable),
        cardDirectionClasses[props.direction],
        !props.cover && cardSizeClasses[props.size]
      )
    )

    const isHorizontal = computed(() => props.direction === 'horizontal')

    const sectionSizeClass = computed(() => (props.cover ? cardSizeClasses[props.size] : undefined))
    const getSectionClasses = (baseClasses: string) =>
      classNames(baseClasses, sectionSizeClass.value)

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const attrsClass = attrsRecord.class
      const attrsStyle = attrsRecord.style

      return h(
        'div',
        {
          ...attrs,
          class: classNames(cardClasses.value, props.className, coerceClassValue(attrsClass)),
          style: mergeStyleValues(attrsStyle, props.style)
        },
        [
          props.cover
            ? h('div', { class: cardCoverWrapperClasses }, [
                h('img', {
                  src: props.cover,
                  alt: props.coverAlt,
                  class: classNames(
                    cardCoverClasses,
                    isHorizontal.value && 'h-full w-48 object-cover'
                  )
                })
              ])
            : null,
          (() => {
            const bodyChildren = [
              slots.header
                ? h('div', { class: getSectionClasses(cardHeaderClasses) }, slots.header())
                : null,
              slots.default ? h('div', { class: sectionSizeClass.value }, slots.default()) : null,
              slots.footer
                ? h('div', { class: getSectionClasses(cardFooterClasses) }, slots.footer())
                : null,
              slots.actions
                ? h(
                    'div',
                    {
                      class: getSectionClasses(classNames(cardActionsClasses, cardFooterClasses))
                    },
                    slots.actions()
                  )
                : null
            ]
            return isHorizontal.value
              ? h('div', { class: cardHorizontalBodyClasses }, bodyChildren)
              : bodyChildren
          })()
        ]
      )
    }
  }
})

export default Card

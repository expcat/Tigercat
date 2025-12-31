import { defineComponent, computed, h, PropType } from 'vue'
import { 
  classNames, 
  getCardClasses, 
  cardSizeClasses,
  cardHeaderClasses,
  cardBodyClasses,
  cardFooterClasses,
  cardCoverWrapperClasses,
  cardCoverClasses,
  cardActionsClasses,
  type CardVariant, 
  type CardSize,
} from '@tigercat/core'

export const Card = defineComponent({
  name: 'TigerCard',
  props: {
    /**
     * Card variant style
     * @default 'default'
     */
    variant: {
      type: String as PropType<CardVariant>,
      default: 'default' as CardVariant,
    },
    /**
     * Card size (affects padding)
     * @default 'md'
     */
    size: {
      type: String as PropType<CardSize>,
      default: 'md' as CardSize,
    },
    /**
     * Whether the card is hoverable (shows hover effect)
     * @default false
     */
    hoverable: {
      type: Boolean,
      default: false,
    },
    /**
     * Cover image URL
     */
    cover: {
      type: String,
      default: undefined,
    },
    /**
     * Cover image alt text
     */
    coverAlt: {
      type: String,
      default: 'Card cover image',
    },
  },
  setup(props, { slots }) {
    const cardClasses = computed(() => {
      return classNames(
        getCardClasses(props.variant, props.hoverable),
        !props.cover && cardSizeClasses[props.size]
      )
    })

    const bodyClasses = computed(() => {
      return classNames(
        cardBodyClasses,
        props.cover && cardSizeClasses[props.size]
      )
    })

    // Helper to get size classes for content sections when cover is present
    const getSectionClasses = (baseClasses: string) => {
      return classNames(baseClasses, props.cover && cardSizeClasses[props.size])
    }

    return () => {
      const children = []
      
      // Add cover image if provided
      if (props.cover) {
        children.push(
          h('div', { class: cardCoverWrapperClasses }, [
            h('img', {
              src: props.cover,
              alt: props.coverAlt,
              class: cardCoverClasses,
            }),
          ])
        )
      }

      // Add header if header slot exists
      if (slots.header) {
        children.push(
          h('div', { class: getSectionClasses(cardHeaderClasses) }, slots.header())
        )
      }

      // Add body (default slot)
      if (slots.default) {
        children.push(
          h('div', { class: bodyClasses.value }, slots.default())
        )
      }

      // Add footer if footer slot exists
      if (slots.footer) {
        children.push(
          h('div', { class: getSectionClasses(cardFooterClasses) }, slots.footer())
        )
      }

      // Add actions if actions slot exists
      if (slots.actions) {
        children.push(
          h('div', { class: getSectionClasses(classNames(cardActionsClasses, cardFooterClasses)) }, slots.actions())
        )
      }

      return h(
        'div',
        {
          class: cardClasses.value,
        },
        children
      )
    }
  },
})

export default Card

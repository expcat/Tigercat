import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getCardClasses,
  getCardCoverWrapperClasses,
  resolveCardPadding,
  resolveCardRoot,
  handleCardActivation,
  cardHeaderClasses,
  cardFooterClasses,
  cardCoverClasses,
  cardActionsClasses,
  cardDirectionClasses,
  cardHorizontalBodyClasses,
  type CardVariant,
  type CardSize,
  type CardProps as CoreCardProps
} from '@expcat/tigercat-core'

export interface VueCardProps {
  variant?: CardVariant
  size?: CardSize
  direction?: CoreCardProps['direction']
  hoverable?: boolean
  cover?: string
  coverAlt?: string
  href?: string
  padding?: boolean | string
  className?: string
  style?: Record<string, string | number>
}

export const Card = defineComponent({
  name: 'TigerCard',
  inheritAttrs: false,
  props: {
    variant: {
      type: String as PropType<CardVariant>,
      default: 'default' as CardVariant
    },
    size: {
      type: String as PropType<CardSize>,
      default: 'md' as CardSize
    },
    padding: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: undefined
    },
    hoverable: {
      type: Boolean,
      default: false
    },
    direction: {
      type: String as PropType<CoreCardProps['direction']>,
      default: 'vertical'
    },
    cover: {
      type: String,
      default: undefined
    },
    coverAlt: {
      type: String,
      default: ''
    },
    href: {
      type: String,
      default: undefined
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
    const paddingClass = computed(() => resolveCardPadding(props.size, props.padding))
    const isHorizontal = computed(() => props.direction === 'horizontal')

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const hasCover = Boolean(slots.cover) || Boolean(props.cover)
      const nestedInteractive = Boolean(slots.actions)
      const clickable = typeof attrsRecord.onClick === 'function' || Boolean(props.href?.trim())
      const root = resolveCardRoot({
        href: props.href,
        clickable,
        nestedInteractive
      })
      const cardClasses = classNames(
        getCardClasses(props.variant, props.hoverable, clickable),
        cardDirectionClasses[props.direction],
        !hasCover && paddingClass.value,
        props.className,
        coerceClassValue(attrsRecord.class)
      )

      const coverNode = hasCover
        ? h(
            'div',
            {
              class: getCardCoverWrapperClasses(isHorizontal.value),
              'data-tiger-card-cover': ''
            },
            slots.cover
              ? slots.cover()
              : [
                  h('img', {
                    src: props.cover,
                    alt: props.coverAlt,
                    class: cardCoverClasses
                  })
                ]
          )
        : null

      const bodyChildren = [
        slots.header ? h('div', { class: cardHeaderClasses }, slots.header()) : null,
        slots.default ? h('div', {}, slots.default()) : null,
        slots.footer ? h('div', { class: cardFooterClasses }, slots.footer()) : null,
        slots.actions
          ? h(
              'div',
              {
                class: classNames(cardActionsClasses, cardFooterClasses),
                onClick: (event: Event) => event.stopPropagation(),
                onKeydown: (event: Event) => event.stopPropagation()
              },
              slots.actions()
            )
          : null
      ]

      const content = hasCover
        ? h(
            'div',
            {
              class: classNames(cardHorizontalBodyClasses, paddingClass.value),
              'data-tiger-card-body': ''
            },
            bodyChildren
          )
        : isHorizontal.value
          ? h('div', { class: cardHorizontalBodyClasses, 'data-tiger-card-body': '' }, bodyChildren)
          : bodyChildren

      const onKeydown = (event: KeyboardEvent) => {
        const user = attrsRecord.onKeydown
        if (typeof user === 'function') {
          ;(user as (event: KeyboardEvent) => void)(event)
        }
        if (event.defaultPrevented || root.tag === 'a') return
        if (root.role) {
          handleCardActivation(event, () => {
            const click = attrsRecord.onClick
            if (typeof click === 'function') {
              ;(click as (event: Event) => void)(event)
              return
            }
            if (props.href) window.location.assign(props.href)
          })
        }
      }

      return h(
        root.tag,
        {
          ...attrs,
          class: cardClasses,
          style: mergeStyleValues(attrsRecord.style, props.style),
          href: root.tag === 'a' ? props.href : undefined,
          role: root.role,
          tabindex: root.tabIndex,
          'data-tiger-card': '',
          onKeydown
        },
        [coverNode, content]
      )
    }
  }
})

export default Card

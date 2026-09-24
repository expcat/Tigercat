import { defineComponent, computed, h, isVNode, PropType, type VNode, type VNodeChild } from 'vue'
import {
  classNames,
  coerceClassValue,
  mergeStyleValues,
  getCardClasses,
  getCardCoverWrapperClasses,
  resolveCardPadding,
  resolveCardActivation,
  handleCardActivation,
  cardHeaderClasses,
  cardTitleTag,
  cardFooterClasses,
  cardCoverClasses,
  cardActionsClasses,
  cardActionsRaisedClasses,
  cardDirectionClasses,
  cardHorizontalBodyClasses,
  cardStretchLinkClasses,
  cardTitleLinkClasses,
  cardElementTypeIsInteractive,
  type CardVariant,
  type CardSize,
  type CardProps as CoreCardProps
} from '@expcat/tigercat-core'

export interface VueCardProps {
  variant?: CardVariant
  size?: CardSize
  orientation?: CoreCardProps['orientation']
  hoverable?: boolean
  cover?: string
  coverAlt?: string
  href?: string
  target?: string
  rel?: string
  title?: string
  htmlTitle?: string
  padding?: boolean | string
  className?: string
  style?: Record<string, string | number>
}

function nodesHaveControl(nodes: VNodeChild | VNodeChild[] | undefined): boolean {
  const list = Array.isArray(nodes) ? nodes : nodes == null ? [] : [nodes]
  for (const node of list) {
    if (!isVNode(node)) continue
    const type = node.type
    const props = (node.props ?? null) as Record<string, unknown> | null
    if (typeof type === 'string' && cardElementTypeIsInteractive(type, props)) return true
    if (type && typeof type === 'object' && 'name' in type) {
      const name = String((type as { name?: string }).name ?? '')
      if (/button|link/i.test(name)) return true
    }
    if (props && (props.onClick || props.href || props.role === 'button')) return true
    if (nodesHaveControl(node.children as VNodeChild)) return true
  }
  return false
}

export const Card = defineComponent({
  name: 'TigerCard',
  inheritAttrs: false,
  props: {
    variant: { type: String as PropType<CardVariant>, default: 'default' as CardVariant },
    size: { type: String as PropType<CardSize>, default: 'md' as CardSize },
    padding: { type: [Boolean, String] as PropType<boolean | string>, default: undefined },
    hoverable: { type: Boolean, default: false },
    orientation: { type: String as PropType<CoreCardProps['orientation']>, default: 'vertical' },
    cover: { type: String, default: undefined },
    coverAlt: { type: String, default: '' },
    href: { type: String, default: undefined },
    target: { type: String, default: undefined },
    rel: { type: String, default: undefined },
    title: { type: String, default: undefined },
    titleLevel: { type: Number, default: 2 },
    htmlTitle: { type: String, default: undefined },
    className: { type: String, default: undefined },
    style: { type: Object as PropType<Record<string, string | number>>, default: undefined }
  },
  setup(props, { slots, attrs }) {
    const paddingClass = computed(() => resolveCardPadding(props.size, props.padding))
    const isHorizontal = computed(() => props.orientation === 'horizontal')

    return () => {
      const attrsRecord = attrs as Record<string, unknown>
      const actionNodes = slots.actions?.()
      const headerNodes = slots.header?.()
      const defaultNodes = slots.default?.()
      const footerNodes = slots.footer?.()
      const coverNodes = slots.cover?.()
      const hasCover = Boolean(coverNodes) || Boolean(props.cover)
      const hasActions = Boolean(actionNodes && actionNodes.length)
      const foreign =
        nodesHaveControl(headerNodes) ||
        nodesHaveControl(defaultNodes) ||
        nodesHaveControl(footerNodes) ||
        nodesHaveControl(coverNodes)
      const target = props.target ?? (typeof attrsRecord.target === 'string' ? attrsRecord.target : undefined)
      const rel = props.rel ?? (typeof attrsRecord.rel === 'string' ? attrsRecord.rel : undefined)
      const clickable = typeof attrsRecord.onClick === 'function' || Boolean(props.href?.trim())
      const activation = resolveCardActivation({
        href: props.href,
        target,
        rel,
        clickable,
        hasActions,
        hasForeignControls: foreign
      })
      const cardClasses = classNames(
        getCardClasses(props.variant, props.hoverable, activation.rootInteractive),
        cardDirectionClasses[props.orientation],
        activation.link?.stretch && 'relative',
        !hasCover && paddingClass.value,
        props.className,
        coerceClassValue(attrsRecord.class)
      )

      const coverNode = hasCover
        ? h(
            'div',
            { class: getCardCoverWrapperClasses(isHorizontal.value), 'data-tiger-card-cover': '' },
            coverNodes ?? [h('img', { src: props.cover, alt: props.coverAlt, class: cardCoverClasses })]
          )
        : null
      const headerNode = headerNodes
        ? h('div', { class: cardHeaderClasses }, headerNodes)
        : props.title
          ? h(cardTitleTag(props.titleLevel), { class: cardHeaderClasses }, props.title)
          : null
      const bodyNode = defaultNodes ? h('div', {}, defaultNodes) : null
      const footerNode = footerNodes ? h('div', { class: cardFooterClasses }, footerNodes) : null
      const actionsNode = hasActions
        ? h(
            'div',
            { class: classNames(cardActionsClasses, cardFooterClasses, cardActionsRaisedClasses) },
            actionNodes
          )
        : null

      const bodyChildren = [headerNode, bodyNode, footerNode]
      const mainChildren = hasCover
        ? [
            coverNode,
            h(
              'div',
              {
                class: classNames(cardHorizontalBodyClasses, paddingClass.value),
                'data-tiger-card-body': ''
              },
              bodyChildren
            )
          ]
        : isHorizontal.value
          ? [h('div', { class: cardHorizontalBodyClasses, 'data-tiger-card-body': '' }, bodyChildren)]
          : [coverNode, ...bodyChildren]

      const onKeydown = (event: KeyboardEvent) => {
        const user = attrsRecord.onKeydown
        if (typeof user === 'function') (user as (event: KeyboardEvent) => void)(event)
        if (event.defaultPrevented || event.key === 'Escape') return
        if (activation.rootRole !== 'button') return
        handleCardActivation(event, () => {
          const click = attrsRecord.onClick
          if (typeof click === 'function') (click as (event: Event) => void)(event)
        })
      }

      const role = activation.rootRole ?? attrsRecord.role
      const tabIndex = activation.rootTabIndex ?? attrsRecord.tabindex ?? attrsRecord.tabIndex
      const domAttrs = { ...attrsRecord }
      delete domAttrs.onClick
      delete domAttrs.onKeydown
      delete domAttrs.class
      delete domAttrs.style
      delete domAttrs.role
      delete domAttrs.tabindex
      delete domAttrs.tabIndex

      const linkNode =
        activation.link?.href &&
        h(
          'a',
          {
            class: activation.link.stretch ? cardStretchLinkClasses : cardTitleLinkClasses,
            href: activation.link.href,
            target: activation.link.target,
            rel: activation.link.rel,
            'data-tiger-card-link': '',
            'aria-label':
              activation.link.stretch || props.title || headerNodes ? undefined : activation.link.href
          },
          activation.link.stretch ? mainChildren : props.title || null
        )

      const beside = activation.link?.stretch
        ? []
        : activation.link
          ? [
              coverNode,
              props.title && !headerNodes ? null : headerNode,
              bodyNode,
              footerNode
            ]
          : mainChildren

      const content = [linkNode, ...beside, actionsNode]

      if (activation.rootTag === 'a' && activation.href) {
        return h(
          'a',
          {
            ...domAttrs,
            class: cardClasses,
            style: mergeStyleValues(attrsRecord.style, props.style),
            href: activation.href,
            target: activation.target,
            rel: activation.rel,
            title: props.htmlTitle,
            role,
            tabindex: tabIndex,
            'data-tiger-card': '',
            onKeydown,
            onClick: activation.rootInteractive ? attrsRecord.onClick : undefined
          },
          [...mainChildren, actionsNode]
        )
      }

      return h(
        'div',
        {
          ...domAttrs,
          class: cardClasses,
          style: mergeStyleValues(attrsRecord.style, props.style),
          title: props.htmlTitle,
          role,
          tabindex: tabIndex,
          'data-tiger-card': '',
          onKeydown,
          onClick: activation.rootInteractive ? attrsRecord.onClick : undefined
        },
        content
      )
    }
  }
})

export default Card

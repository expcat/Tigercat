import React, { forwardRef } from 'react'
import {
  cardActionsClasses,
  cardActionsRaisedClasses,
  cardCoverClasses,
  cardDirectionClasses,
  cardFooterClasses,
  cardHeaderClasses,
  cardTitleTag,
  cardHorizontalBodyClasses,
  cardStretchLinkClasses,
  cardTitleLinkClasses,
  classNames,
  getCardClasses,
  getCardCoverWrapperClasses,
  handleCardActivation,
  resolveCardActivation,
  resolveCardPadding,
  cardElementTypeIsInteractive,
  type CardProps as CoreCardProps
} from '@expcat/tigercat-core'

export interface CardProps
  extends
    Omit<React.HTMLAttributes<HTMLElement>, 'onClick' | 'title'>,
    Omit<CoreCardProps, 'cover'> {
  children?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  actions?: React.ReactNode
  /** Cover image URL or custom node (e.g. Image). */
  cover?: React.ReactNode
  coverAlt?: string
  href?: string
  target?: string
  rel?: string
  onClick?: React.MouseEventHandler<HTMLElement>
}

function nodeHasControl(node: React.ReactNode): boolean {
  if (node == null || typeof node === 'boolean' || typeof node === 'string' || typeof node === 'number') {
    return false
  }
  if (Array.isArray(node)) return node.some(nodeHasControl)
  if (!React.isValidElement(node)) return false
  const props = node.props as Record<string, unknown>
  const type = node.type
  if (cardElementTypeIsInteractive(typeof type === 'string' ? type : undefined, props)) return true
  if (typeof type === 'function' || (typeof type === 'object' && type)) {
    const named = type as { displayName?: string; name?: string }
    const name = named.displayName || named.name || ''
    if (/button|link/i.test(name)) return true
  }
  return nodeHasControl(props.children as React.ReactNode)
}

function renderCover(
  cover: React.ReactNode,
  coverAlt: string,
  horizontal: boolean
): React.ReactNode {
  if (cover == null || cover === false) return null
  const wrapperClass = getCardCoverWrapperClasses(horizontal)
  if (typeof cover === 'string') {
    return (
      <div className={wrapperClass} data-tiger-card-cover="">
        <img src={cover} alt={coverAlt} className={cardCoverClasses} />
      </div>
    )
  }
  return (
    <div className={wrapperClass} data-tiger-card-cover="">
      {cover}
    </div>
  )
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    variant = 'default',
    size = 'md',
    orientation = 'vertical',
    hoverable = false,
    cover,
    coverAlt = '',
    href,
    target,
    rel,
    padding,
    header,
    title,
    titleLevel = 2,
    htmlTitle,
    footer,
    actions,
    className,
    children,
    onClick,
    onKeyDown,
    role: roleProp,
    tabIndex: tabIndexProp,
    ...props
  },
  ref
) {
  const isHorizontal = orientation === 'horizontal'
  const hasCover = cover != null && cover !== false
  const hasActions = actions != null
  const foreign =
    nodeHasControl(header) ||
    nodeHasControl(children) ||
    nodeHasControl(footer) ||
    (typeof cover !== 'string' && nodeHasControl(cover))
  const clickable = Boolean(onClick) || Boolean(href?.trim())
  const activation = resolveCardActivation({
    href,
    target,
    rel,
    clickable,
    hasActions,
    hasForeignControls: foreign
  })
  const paddingClass = resolveCardPadding(size, padding)
  const cardClasses = classNames(
    getCardClasses(variant, hoverable, activation.rootInteractive),
    cardDirectionClasses[orientation],
    activation.link?.stretch && 'relative',
    !hasCover && paddingClass,
    className
  )

  const headerNode =
    header != null || title ? (
      header != null ? (
        <div className={cardHeaderClasses}>{header}</div>
      ) : (
        React.createElement(cardTitleTag(titleLevel), { className: cardHeaderClasses }, title)
      )
    ) : null
  const bodyNode = children != null ? <div>{children}</div> : null
  const footerNode = footer != null ? <div className={cardFooterClasses}>{footer}</div> : null
  const actionsNode =
    actions != null ? (
      <div className={classNames(cardActionsClasses, cardFooterClasses, cardActionsRaisedClasses)}>
        {actions}
      </div>
    ) : null

  const coverNode = renderCover(cover, coverAlt, isHorizontal)
  const main = (
    <>
      {coverNode}
      {hasCover ? (
        <div className={classNames(cardHorizontalBodyClasses, paddingClass)} data-tiger-card-body="">
          {headerNode}
          {bodyNode}
          {footerNode}
        </div>
      ) : isHorizontal ? (
        <div className={cardHorizontalBodyClasses} data-tiger-card-body="">
          {headerNode}
          {bodyNode}
          {footerNode}
        </div>
      ) : (
        <>
          {headerNode}
          {bodyNode}
          {footerNode}
        </>
      )}
    </>
  )

  const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.key === 'Escape') return
    if (activation.rootRole !== 'button') return
    handleCardActivation(event, () => {
      onClick?.(event as unknown as React.MouseEvent<HTMLElement>)
    })
  }

  const shared = {
    ...props,
    title: htmlTitle,
    className: cardClasses,
    onClick: activation.rootInteractive ? onClick : undefined,
    onKeyDown: handleKeyDown,
    role: activation.rootRole ?? roleProp,
    tabIndex: activation.rootTabIndex ?? tabIndexProp,
    'data-tiger-card': ''
  }

  if (activation.rootTag === 'a' && activation.href) {
    return (
      <a
        {...shared}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={activation.href}
        target={activation.target}
        rel={activation.rel}>
        {main}
        {actionsNode}
      </a>
    )
  }

  const titleText = typeof title === 'string' ? title : typeof header === 'string' ? header : ''
  const separateLink = activation.link?.href ? (
    <a
      className={activation.link.stretch ? cardStretchLinkClasses : cardTitleLinkClasses}
      href={activation.link.href}
      target={activation.link.target}
      rel={activation.link.rel}
      data-tiger-card-link=""
      aria-label={activation.link.stretch || titleText ? undefined : activation.link.href}>
      {activation.link.stretch ? main : titleText || null}
    </a>
  ) : null

  const showMainBesideLink = !activation.link?.stretch
  const titleLivesInLink = Boolean(separateLink) && !activation.link?.stretch
  const heading = titleLivesInLink
    ? typeof header === 'string' || header == null
      ? null
      : headerNode
    : headerNode

  return (
    <div {...shared} ref={ref as React.Ref<HTMLDivElement>}>
      {separateLink}
      {showMainBesideLink ? (
        <>
          {coverNode}
          {hasCover ? (
            <div
              className={classNames(cardHorizontalBodyClasses, paddingClass)}
              data-tiger-card-body="">
              {heading}
              {bodyNode}
              {footerNode}
            </div>
          ) : isHorizontal ? (
            <div className={cardHorizontalBodyClasses} data-tiger-card-body="">
              {heading}
              {bodyNode}
              {footerNode}
            </div>
          ) : (
            <>
              {heading}
              {bodyNode}
              {footerNode}
            </>
          )}
        </>
      ) : null}
      {actionsNode}
    </div>
  )
})
Card.displayName = 'Card'

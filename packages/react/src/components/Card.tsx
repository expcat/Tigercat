import React, { forwardRef } from 'react'
import {
  classNames,
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
  type CardProps as CoreCardProps
} from '@expcat/tigercat-core'

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'>, Omit<CoreCardProps, 'cover'> {
  children?: React.ReactNode
  header?: React.ReactNode
  footer?: React.ReactNode
  actions?: React.ReactNode
  /** Cover image URL or custom node (e.g. Image). */
  cover?: React.ReactNode
  coverAlt?: string
  href?: string
  onClick?: React.MouseEventHandler<HTMLElement>
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
    direction = 'vertical',
    hoverable = false,
    cover,
    coverAlt = '',
    href,
    padding,
    header,
    footer,
    actions,
    className,
    children,
    onClick,
    onKeyDown,
    ...props
  },
  ref
) {
  const isHorizontal = direction === 'horizontal'
  const hasCover = cover != null && cover !== false
  const nestedInteractive = actions != null
  const clickable = Boolean(onClick) || Boolean(href?.trim())
  const root = resolveCardRoot({ href, clickable, nestedInteractive })
  const paddingClass = resolveCardPadding(size, padding)
  const cardClasses = classNames(
    getCardClasses(variant, hoverable, clickable),
    cardDirectionClasses[direction],
    !hasCover && paddingClass,
    className
  )

  const bodyContent = (
    <>
      {header != null && <div className={cardHeaderClasses}>{header}</div>}
      {children != null && <div>{children}</div>}
      {footer != null && <div className={cardFooterClasses}>{footer}</div>}
      {actions != null && (
        <div
          className={classNames(cardActionsClasses, cardFooterClasses)}
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}>
          {actions}
        </div>
      )}
    </>
  )

  const content = hasCover ? (
    <div className={classNames(cardHorizontalBodyClasses, paddingClass)} data-tiger-card-body="">
      {bodyContent}
    </div>
  ) : isHorizontal ? (
    <div className={cardHorizontalBodyClasses} data-tiger-card-body="">
      {bodyContent}
    </div>
  ) : (
    bodyContent
  )

  const handleKeyDown: React.KeyboardEventHandler<HTMLElement> = (event) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || root.tag === 'a') return
    if (root.role) {
      handleCardActivation(event, () => {
        if (href) {
          window.location.assign(href)
          return
        }
        onClick?.(event as unknown as React.MouseEvent<HTMLElement>)
      })
    }
  }

  const shared = {
    ...props,
    className: cardClasses,
    onClick,
    onKeyDown: handleKeyDown,
    role: root.role,
    tabIndex: root.tabIndex,
    'data-tiger-card': ''
  }

  if (root.tag === 'a') {
    return (
      <a {...shared} ref={ref as React.Ref<HTMLAnchorElement>} href={href}>
        {renderCover(cover, coverAlt, isHorizontal)}
        {content}
      </a>
    )
  }

  return (
    <div {...shared} ref={ref as React.Ref<HTMLDivElement>}>
      {renderCover(cover, coverAlt, isHorizontal)}
      {content}
    </div>
  )
})
Card.displayName = 'Card'

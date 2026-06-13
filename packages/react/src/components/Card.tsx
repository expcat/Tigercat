import React from 'react'
import {
  classNames,
  getCardClasses,
  resolveCardPadding,
  cardHeaderClasses,
  cardFooterClasses,
  cardCoverWrapperClasses,
  cardCoverClasses,
  cardActionsClasses,
  cardDirectionClasses,
  cardHorizontalBodyClasses,
  type CardProps as CoreCardProps
} from '@expcat/tigercat-core'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, CoreCardProps {
  /**
   * Card content (main body)
   */
  children?: React.ReactNode
  /**
   * Card header content
   */
  header?: React.ReactNode
  /**
   * Card footer content
   */
  footer?: React.ReactNode
  /**
   * Card actions (buttons, links, etc.)
   */
  actions?: React.ReactNode
  /**
   * Cover image URL
   */
  cover?: string
  /**
   * Cover image alt text
   * @default 'Card cover image'
   */
  coverAlt?: string
}

export const Card: React.FC<CardProps> = React.memo(
  ({
    variant = 'default',
    size = 'md',
    direction = 'vertical',
    hoverable = false,
    cover,
    coverAlt = 'Card cover image',
    padding,
    header,
    footer,
    actions,
    className,
    children,
    ...props
  }) => {
    const isHorizontal = direction === 'horizontal'
    const paddingClass = resolveCardPadding(size, padding)
    const sectionSizeClass = cover ? paddingClass : undefined
    const cardClasses = classNames(
      getCardClasses(variant, hoverable),
      cardDirectionClasses[direction],
      !cover && paddingClass,
      className
    )
    const getSectionClasses = (baseClasses: string) => classNames(baseClasses, sectionSizeClass)

    const bodyContent = (
      <>
        {header != null && <div className={getSectionClasses(cardHeaderClasses)}>{header}</div>}
        {children != null && <div className={sectionSizeClass}>{children}</div>}
        {footer != null && <div className={getSectionClasses(cardFooterClasses)}>{footer}</div>}
        {actions != null && (
          <div className={getSectionClasses(classNames(cardActionsClasses, cardFooterClasses))}>
            {actions}
          </div>
        )}
      </>
    )

    return (
      <div className={cardClasses} {...props}>
        {cover && (
          <div className={cardCoverWrapperClasses}>
            <img
              src={cover}
              alt={coverAlt}
              className={classNames(cardCoverClasses, isHorizontal && 'h-full w-48 object-cover')}
            />
          </div>
        )}
        {isHorizontal ? (
          <div className={cardHorizontalBodyClasses}>{bodyContent}</div>
        ) : (
          bodyContent
        )}
      </div>
    )
  }
)
Card.displayName = 'Card'

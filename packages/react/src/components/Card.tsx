import React from 'react'
import {
  classNames,
  getCardClasses,
  cardSizeClasses,
  cardHeaderClasses,
  cardFooterClasses,
  cardCoverWrapperClasses,
  cardCoverClasses,
  cardActionsClasses,
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

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'md',
  hoverable = false,
  cover,
  coverAlt = 'Card cover image',
  header,
  footer,
  actions,
  className,
  children,
  ...props
}) => {
  const sectionSizeClass = cover ? cardSizeClasses[size] : undefined
  const cardClasses = classNames(
    getCardClasses(variant, hoverable),
    !cover && cardSizeClasses[size],
    className
  )
  const getSectionClasses = (baseClasses: string) => classNames(baseClasses, sectionSizeClass)

  return (
    <div className={cardClasses} {...props}>
      {cover && (
        <div className={cardCoverWrapperClasses}>
          <img src={cover} alt={coverAlt} className={cardCoverClasses} />
        </div>
      )}
      {header != null && <div className={getSectionClasses(cardHeaderClasses)}>{header}</div>}
      {children != null && <div className={sectionSizeClass}>{children}</div>}
      {footer != null && <div className={getSectionClasses(cardFooterClasses)}>{footer}</div>}
      {actions != null && (
        <div className={getSectionClasses(classNames(cardActionsClasses, cardFooterClasses))}>
          {actions}
        </div>
      )}
    </div>
  )
}

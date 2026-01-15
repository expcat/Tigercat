import React from 'react'
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
  const bodyClasses = classNames(cardBodyClasses, sectionSizeClass)
  const getSectionClasses = (baseClasses: string) => classNames(baseClasses, sectionSizeClass)

  return (
    <div className={cardClasses} {...props}>
      {/* Cover Image */}
      {cover && (
        <div className={cardCoverWrapperClasses}>
          <img src={cover} alt={coverAlt} className={cardCoverClasses} />
        </div>
      )}

      {/* Header */}
      {header != null && <div className={getSectionClasses(cardHeaderClasses)}>{header}</div>}

      {/* Body */}
      {children != null && <div className={bodyClasses}>{children}</div>}

      {/* Footer */}
      {footer != null && <div className={getSectionClasses(cardFooterClasses)}>{footer}</div>}

      {/* Actions */}
      {actions != null && (
        <div className={getSectionClasses(classNames(cardActionsClasses, cardFooterClasses))}>
          {actions}
        </div>
      )}
    </div>
  )
}

import React, { useMemo } from 'react'
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
} from '@tigercat/core'

export interface CardProps extends CoreCardProps {
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
  const cardClasses = useMemo(() => {
    return classNames(
      getCardClasses(variant, hoverable),
      !cover && cardSizeClasses[size],
      className
    )
  }, [variant, hoverable, cover, size, className])

  const bodyClasses = useMemo(() => {
    return classNames(
      cardBodyClasses,
      cover && cardSizeClasses[size]
    )
  }, [cover, size])

  // Helper to get size classes for content sections when cover is present
  const getSectionClasses = (baseClasses: string) => {
    return classNames(baseClasses, cover && cardSizeClasses[size])
  }

  return (
    <div className={cardClasses} {...props}>
      {/* Cover Image */}
      {cover && (
        <div className={cardCoverWrapperClasses}>
          <img src={cover} alt={coverAlt} className={cardCoverClasses} />
        </div>
      )}

      {/* Header */}
      {header && (
        <div className={getSectionClasses(cardHeaderClasses)}>
          {header}
        </div>
      )}

      {/* Body */}
      {children && (
        <div className={bodyClasses}>
          {children}
        </div>
      )}

      {/* Footer */}
      {footer && (
        <div className={getSectionClasses(cardFooterClasses)}>
          {footer}
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className={getSectionClasses(classNames(cardActionsClasses, cardFooterClasses))}>
          {actions}
        </div>
      )}
    </div>
  )
}

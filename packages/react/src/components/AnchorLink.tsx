import React, { useEffect, useMemo } from 'react'
import { classNames, getAnchorLinkClasses } from '@expcat/tigercat-core'
import { useAnchorContext } from './Anchor'

export interface AnchorLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  /**
   * Target anchor ID (with #)
   */
  href: string
  /**
   * Link title/text
   */
  title?: string
  /**
   * Link target attribute
   */
  target?: string
  /**
   * Children content
   */
  children?: React.ReactNode
}

export const AnchorLink: React.FC<AnchorLinkProps> = ({
  href,
  title,
  target,
  className,
  children,
  ...props
}) => {
  const anchorContext = useAnchorContext()

  // Register link on mount
  useEffect(() => {
    anchorContext?.registerLink(href)

    return () => {
      anchorContext?.unregisterLink(href)
    }
  }, [href, anchorContext])

  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    anchorContext?.handleLinkClick(href, event)
  }

  // Computed classes
  const linkClasses = useMemo(() => {
    const isActive = anchorContext?.activeLink === href
    return classNames(getAnchorLinkClasses(isActive, className))
  }, [anchorContext?.activeLink, href, className])

  const content = children ?? title

  return (
    <a
      href={href}
      target={target}
      className={linkClasses}
      data-anchor-href={href}
      onClick={handleClick}
      {...props}>
      {content}
    </a>
  )
}

export default AnchorLink

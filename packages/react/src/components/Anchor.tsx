import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react'
import {
  classNames,
  getAnchorWrapperClasses,
  getAnchorInkContainerClasses,
  getAnchorInkActiveClasses,
  getAnchorLinkListClasses,
  findActiveAnchor,
  scrollToAnchor,
  type AnchorDirection,
  type AnchorProps as CoreAnchorProps
} from '@expcat/tigercat-core'

// Anchor context interface
export interface AnchorContextValue {
  activeLink: string
  direction: AnchorDirection
  registerLink: (href: string) => void
  unregisterLink: (href: string) => void
  handleLinkClick: (href: string, event: React.MouseEvent) => void
  scrollTo: (href: string) => void
}

// Create anchor context
const AnchorContext = createContext<AnchorContextValue | null>(null)

// Hook to use anchor context
export function useAnchorContext(): AnchorContextValue | null {
  return useContext(AnchorContext)
}

export interface AnchorProps extends Omit<CoreAnchorProps, 'style'> {
  /**
   * Target element to listen for scroll events
   * @default () => window
   */
  getContainer?: () => HTMLElement | Window
  /**
   * Click event handler
   */
  onClick?: (event: React.MouseEvent, href: string) => void
  /**
   * Change event handler when active anchor changes
   */
  onChange?: (currentActiveLink: string) => void
  /**
   * Children (AnchorLink components)
   */
  children?: React.ReactNode
  /**
   * Custom styles
   */
  style?: React.CSSProperties
}

export const Anchor: React.FC<AnchorProps> = ({
  affix = true,
  bounds = 5,
  offsetTop = 0,
  showInkInFixed = false,
  targetOffset,
  getCurrentAnchor,
  getContainer = () => window,
  direction = 'vertical',
  className,
  style,
  onClick,
  onChange,
  children
}) => {
  const [activeLink, setActiveLink] = useState('')
  const [links, setLinks] = useState<string[]>([])
  const anchorRef = useRef<HTMLDivElement>(null)
  const inkRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const animationFrameRef = useRef<number | null>(null)

  // Get scroll offset
  const scrollOffset = useMemo(
    () => targetOffset ?? offsetTop,
    [targetOffset, offsetTop]
  )

  // Register a link
  const registerLink = useCallback((href: string) => {
    setLinks((prevLinks) => {
      if (href && !prevLinks.includes(href)) {
        return [...prevLinks, href]
      }
      return prevLinks
    })
  }, [])

  // Unregister a link
  const unregisterLink = useCallback((href: string) => {
    setLinks((prevLinks) => prevLinks.filter((l) => l !== href))
  }, [])

  // Scroll to anchor
  const scrollTo = useCallback((href: string) => {
    const container = getContainer()
    scrollToAnchor(href, container, scrollOffset)
  }, [getContainer, scrollOffset])

  // Handle link click
  const handleLinkClick = useCallback(
    (href: string, event: React.MouseEvent) => {
      event.preventDefault()
      onClick?.(event, href)

      // Prevent scroll handler from running during programmatic scroll
      isScrollingRef.current = true
      setActiveLink(href)

      scrollTo(href)

      // Re-enable scroll handler after animation
      setTimeout(() => {
        isScrollingRef.current = false
      }, 500)
    },
    [onClick, scrollTo]
  )

  // Handle scroll events
  useEffect(() => {
    const container = getContainer()

    const handleScroll = () => {
      if (isScrollingRef.current) return

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const newActiveLink = findActiveAnchor(links, container, bounds, scrollOffset)

        // Apply custom getCurrentAnchor if provided
        const finalActiveLink = getCurrentAnchor
          ? getCurrentAnchor(newActiveLink)
          : newActiveLink

        setActiveLink((prevActiveLink) => {
          if (finalActiveLink !== prevActiveLink) {
            onChange?.(finalActiveLink)
            return finalActiveLink
          }
          return prevActiveLink
        })
      })
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [getContainer, links, bounds, scrollOffset, getCurrentAnchor, onChange])

  // Update ink position
  useEffect(() => {
    if (!inkRef.current || !anchorRef.current || !activeLink) {
      return
    }

    const activeLinkElement = anchorRef.current.querySelector(
      `[data-anchor-href="${activeLink}"]`
    ) as HTMLElement | null

    if (!activeLinkElement) {
      return
    }

    const anchorRect = anchorRef.current.getBoundingClientRect()
    const linkRect = activeLinkElement.getBoundingClientRect()

    if (direction === 'vertical') {
      inkRef.current.style.top = `${linkRect.top - anchorRect.top}px`
      inkRef.current.style.height = `${linkRect.height}px`
    } else {
      inkRef.current.style.left = `${linkRect.left - anchorRect.left}px`
      inkRef.current.style.width = `${linkRect.width}px`
    }
  }, [activeLink, direction])

  // Computed classes
  const wrapperClasses = useMemo(
    () => classNames(getAnchorWrapperClasses(affix, className)),
    [affix, className]
  )

  const inkContainerClasses = useMemo(
    () => getAnchorInkContainerClasses(direction),
    [direction]
  )

  const inkActiveClasses = useMemo(
    () => getAnchorInkActiveClasses(direction),
    [direction]
  )

  const linkListClasses = useMemo(
    () => getAnchorLinkListClasses(direction),
    [direction]
  )

  const showInk = useMemo(() => {
    if (!affix) return true
    return showInkInFixed
  }, [affix, showInkInFixed])

  const wrapperStyle = useMemo<React.CSSProperties>(() => {
    const baseStyle: React.CSSProperties = {}
    if (affix && offsetTop > 0) {
      baseStyle.top = `${offsetTop}px`
    }
    return { ...baseStyle, ...style }
  }, [affix, offsetTop, style])

  // Context value
  const contextValue = useMemo<AnchorContextValue>(
    () => ({
      activeLink,
      direction,
      registerLink,
      unregisterLink,
      handleLinkClick,
      scrollTo
    }),
    [activeLink, direction, registerLink, unregisterLink, handleLinkClick, scrollTo]
  )

  return (
    <AnchorContext.Provider value={contextValue}>
      <div ref={anchorRef} className={wrapperClasses} style={wrapperStyle}>
        {showInk && (
          <div className={inkContainerClasses}>
            <div ref={inkRef} className={inkActiveClasses} />
          </div>
        )}
        <div className={linkListClasses}>{children}</div>
      </div>
    </AnchorContext.Provider>
  )
}

export default Anchor

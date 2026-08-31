import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  classNames,
  anchorNestedListClasses,
  createAnchorObserver,
  createProgrammaticScrollLock,
  findAnchorLinkElement,
  getAnchorInkActiveClasses,
  getAnchorInkContainerClasses,
  getAnchorInkStyle,
  getAnchorLabels,
  getAnchorLinkClasses,
  getAnchorLinkListClasses,
  getAnchorTargetElement,
  getAnchorWrapperClasses,
  mergeTigerLocale,
  replaceAnchorHash,
  resolveActiveAnchorHref,
  resolveAnchorScrollContainer,
  resolveScrollRoot,
  scrollToAnchor,
  shouldHandleAnchorClick,
  sortAnchorHrefsByDocumentOrder,
  type AnchorDirection,
  type AnchorProps as CoreAnchorProps,
  type TigerLocale,
  type TigerLocaleAnchor
} from '@expcat/tigercat-core'
import { Affix } from './Affix'
import { useTigerConfig } from './ConfigProvider'

export interface AnchorContextValue {
  activeLink: string
  direction: AnchorDirection
  registerLink: (href: string, node: Element) => void
  unregisterLink: (href: string, node: Element) => void
  handleLinkClick: (href: string, event: React.MouseEvent, targetAttr?: string) => void
}

const AnchorContext = createContext<AnchorContextValue | null>(null)

export function useAnchorContext(): AnchorContextValue | null {
  return useContext(AnchorContext)
}

export interface AnchorLinkProps extends Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
> {
  href: string
  title?: React.ReactNode
  target?: string
  children?: React.ReactNode
}

export const AnchorLink: React.FC<AnchorLinkProps> = ({
  href,
  title,
  target,
  className,
  children,
  onClick,
  ...props
}) => {
  const anchorContext = useAnchorContext()
  const nodeRef = useRef<HTMLAnchorElement>(null)
  const register = anchorContext?.registerLink
  const unregister = anchorContext?.unregisterLink

  useLayoutEffect(() => {
    const node = nodeRef.current
    if (!href || !node || !register) return undefined
    register(href, node)
    return () => {
      unregister?.(href, node)
    }
  }, [href, register, unregister])

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (!anchorContext) return
    anchorContext.handleLinkClick(href, event, target)
  }

  const isActive = anchorContext?.activeLink === href
  const linkClasses = classNames(getAnchorLinkClasses(Boolean(isActive), className))
  const nested = title != null && children != null

  const link = (
    <a
      {...props}
      ref={nodeRef}
      href={href}
      target={target}
      className={linkClasses}
      data-anchor-href={href}
      aria-current={isActive ? 'location' : undefined}
      onClick={handleClick}>
      {nested ? title : (title ?? children)}
    </a>
  )

  if (!anchorContext) return link

  return (
    <li>
      {link}
      {nested ? <ul className={anchorNestedListClasses}>{children}</ul> : null}
    </li>
  )
}

export interface AnchorProps extends Omit<CoreAnchorProps, 'style' | 'onClick'> {
  onClick?: (event: React.MouseEvent, href: string) => void
  onChange?: (activeLink: string) => void
  children?: React.ReactNode
  style?: React.CSSProperties
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleAnchor>
  'aria-label'?: string
}

export const Anchor = forwardRef<HTMLElement, AnchorProps>(function Anchor(
  {
    affix = true,
    bounds = 5,
    offsetTop = 0,
    showInkInFixed = true,
    targetOffset,
    getCurrentAnchor,
    getContainer,
    direction = 'vertical',
    className,
    style,
    onClick,
    onChange,
    children,
    locale,
    labels,
    'aria-label': ariaLabel
  },
  ref
) {
  const [activeLink, setActiveLink] = useState('')
  const [linkEntries, setLinkEntries] = useState<Array<{ href: string; node: Element }>>([])
  const anchorRef = useRef<HTMLElement | null>(null)
  const inkRef = useRef<HTMLDivElement>(null)
  const getContainerRef = useRef(getContainer)
  getContainerRef.current = getContainer
  const getCurrentAnchorRef = useRef(getCurrentAnchor)
  getCurrentAnchorRef.current = getCurrentAnchor
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const scrollLockRef = useRef(
    createProgrammaticScrollLock(() => resolveAnchorScrollContainer(getContainerRef.current))
  )

  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labelSet = getAnchorLabels(mergedLocale, labels)
  const navLabel = ariaLabel ?? labelSet.ariaLabel

  const scrollOffset = targetOffset ?? offsetTop
  const links = useMemo(() => sortAnchorHrefsByDocumentOrder(linkEntries), [linkEntries])

  const registerLink = useCallback((href: string, node: Element) => {
    setLinkEntries((prev) => {
      if (prev.some((entry) => entry.node === node)) {
        return prev.map((entry) => (entry.node === node ? { href, node } : entry))
      }
      return [...prev, { href, node }]
    })
  }, [])

  const unregisterLink = useCallback((href: string, node: Element) => {
    setLinkEntries((prev) => prev.filter((entry) => entry.node !== node || entry.href !== href))
  }, [])

  const applyActive = useCallback((href: string) => {
    const finalHref = resolveActiveAnchorHref(href, getCurrentAnchorRef.current)
    setActiveLink((prev) => {
      if (finalHref !== prev) {
        onChangeRef.current?.(finalHref)
        return finalHref
      }
      return prev
    })
    return finalHref
  }, [])

  const scrollTo = useCallback(
    (href: string) => {
      const container = resolveAnchorScrollContainer(getContainerRef.current)
      scrollToAnchor(href, container, scrollOffset)
    },
    [scrollOffset]
  )

  const handleLinkClick = useCallback(
    (href: string, event: React.MouseEvent, targetAttr?: string) => {
      const hasTargetElement = Boolean(getAnchorTargetElement(href))
      if (
        !shouldHandleAnchorClick(event.nativeEvent, {
          target: targetAttr,
          hasTargetElement
        })
      ) {
        onClick?.(event, href)
        return
      }
      event.preventDefault()
      onClick?.(event, href)
      const finalHref = applyActive(href)
      scrollLockRef.current.lock()
      scrollTo(finalHref)
      replaceAnchorHash(finalHref)
    },
    [applyActive, onClick, scrollTo]
  )

  const resolved = resolveScrollRoot(getContainer)
  const resolvedKey = resolved.isWindow ? 'window' : resolved.target

  useEffect(() => {
    const container = resolveAnchorScrollContainer(getContainerRef.current)
    const root = container === window ? null : (container as Element)
    const stop = createAnchorObserver(links, {
      offsetTop: scrollOffset,
      bounds,
      root,
      onChange: (newActiveLink) => {
        if (scrollLockRef.current.isLocked()) return
        applyActive(newActiveLink)
      }
    })
    return () => {
      stop()
    }
  }, [bounds, links, scrollOffset, resolvedKey, applyActive])

  useEffect(() => {
    return () => {
      scrollLockRef.current.dispose()
    }
  }, [])

  useLayoutEffect(() => {
    const ink = inkRef.current
    const root = anchorRef.current
    if (!ink || !root || !activeLink) return
    const activeLinkElement = findAnchorLinkElement(root, activeLink)
    if (!activeLinkElement) return
    const next = getAnchorInkStyle(
      direction,
      activeLinkElement.getBoundingClientRect(),
      root.getBoundingClientRect()
    )
    ink.style.top = next.top
    ink.style.height = next.height
    ink.style.insetInlineStart = next.insetInlineStart
    ink.style.width = next.width
  }, [activeLink, direction, links])

  const wrapperClasses = classNames(getAnchorWrapperClasses(className))
  const showInk = !affix || showInkInFixed

  const setNavRef = (node: HTMLElement | null) => {
    anchorRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const contextValue = useMemo<AnchorContextValue>(
    () => ({
      activeLink,
      direction,
      registerLink,
      unregisterLink,
      handleLinkClick
    }),
    [activeLink, direction, registerLink, unregisterLink, handleLinkClick]
  )

  const nav = (
    <nav ref={setNavRef} className={wrapperClasses} style={style} aria-label={navLabel}>
      {showInk && (
        <div className={getAnchorInkContainerClasses(direction)}>
          <div ref={inkRef} className={getAnchorInkActiveClasses(direction)} />
        </div>
      )}
      <ul className={getAnchorLinkListClasses(direction)}>{children}</ul>
    </nav>
  )

  return (
    <AnchorContext.Provider value={contextValue}>
      {affix ? <Affix offsetTop={offsetTop}>{nav}</Affix> : nav}
    </AnchorContext.Provider>
  )
})

Anchor.displayName = 'Anchor'

export default Anchor

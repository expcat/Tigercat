/**
 * BackTop component utilities
 */

/**
 * Get the current scroll position of an element or window
 */
export function getScrollTop(target: HTMLElement | Window): number {
  if (target === window) {
    return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  }
  return (target as HTMLElement).scrollTop
}

/**
 * Smooth scroll to top using requestAnimationFrame
 * Uses easeInOutCubic easing function for natural feel
 */
export function scrollToTop(
  target: HTMLElement | Window,
  duration: number,
  callback?: () => void
): void {
  const startTime = performance.now()
  const startScrollTop = getScrollTop(target)

  if (startScrollTop === 0) {
    callback?.()
    return
  }

  // easeInOutCubic easing function
  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  const animateScroll = (currentTime: number): void => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easeInOutCubic(progress)
    const newScrollTop = startScrollTop * (1 - easedProgress)

    if (target === window) {
      window.scrollTo(0, newScrollTop)
    } else {
      ;(target as HTMLElement).scrollTop = newScrollTop
    }

    if (progress < 1) {
      requestAnimationFrame(animateScroll)
    } else {
      callback?.()
    }
  }

  requestAnimationFrame(animateScroll)
}

/**
 * Base CSS classes for the BackTop button (without positioning)
 */
export const backTopBaseClasses =
  'z-50 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[var(--tiger-primary,#2563eb)] text-white shadow-lg transition-all duration-300 hover:bg-[var(--tiger-primary-hover,#1d4ed8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-primary,#2563eb)] focus-visible:ring-offset-2'

/**
 * Default CSS classes for the BackTop button (fixed positioning for window target)
 */
export const backTopButtonClasses = `fixed bottom-8 right-8 ${backTopBaseClasses}`

/**
 * CSS classes for the BackTop button when using a custom scroll container (sticky positioning)
 * Should be placed inside the scroll container content to stay visible while scrolling
 */
export const backTopContainerClasses = `sticky bottom-4 ml-auto mr-4 ${backTopBaseClasses}`

/**
 * Default CSS classes for hidden state
 */
export const backTopHiddenClasses = 'opacity-0 pointer-events-none translate-y-4'

/**
 * Default CSS classes for visible state
 */
export const backTopVisibleClasses = 'opacity-100 translate-y-0'

/**
 * Default up arrow icon SVG path
 */
export const backTopIconPath = 'M12 19V5M12 5l-7 7M12 5l7 7'

import React, { useEffect } from 'react'
import {
  getFocusTrapNavigation,
  getFocusableElements,
  isEscapeKey,
  isEventOutside
} from '@expcat/tigercat-core'

export interface UseClickOutsideOptions {
  enabled: boolean
  refs: Array<React.RefObject<HTMLElement | null> | undefined>
  onOutsideClick: () => void
  defer?: boolean
}

export function useClickOutside({
  enabled,
  refs,
  onOutsideClick,
  defer = false
}: UseClickOutsideOptions): void {
  useEffect(() => {
    if (!enabled) return

    const handler = (event: MouseEvent) => {
      const elements = refs.map((ref) => ref?.current)
      if (isEventOutside(event, elements)) {
        onOutsideClick()
      }
    }

    const attach = () => document.addEventListener('click', handler)
    const detach = () => document.removeEventListener('click', handler)

    if (!defer) {
      attach()
      return () => detach()
    }

    const timer = window.setTimeout(() => attach(), 0)
    return () => {
      window.clearTimeout(timer)
      detach()
    }
  }, [enabled, refs, onOutsideClick, defer])
}

export interface UseEscapeKeyOptions {
  enabled: boolean
  onEscape: () => void
}

export function useEscapeKey({ enabled, onEscape }: UseEscapeKeyOptions): void {
  useEffect(() => {
    if (!enabled) return

    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (!isEscapeKey(event)) return
      onEscape()
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [enabled, onEscape])
}

export interface UseFocusTrapOptions {
  enabled: boolean
  containerRef: React.RefObject<HTMLElement | null>
}

export function useFocusTrap({ enabled, containerRef }: UseFocusTrapOptions): void {
  useEffect(() => {
    const container = containerRef.current
    if (!enabled || !container) return

    const handler = (event: KeyboardEvent) => {
      const focusables = getFocusableElements(container)
      const nav = getFocusTrapNavigation(event, focusables, document.activeElement)
      if (!nav.shouldHandle || !nav.next) return

      event.preventDefault()
      nav.next.focus()
    }

    container.addEventListener('keydown', handler)
    return () => container.removeEventListener('keydown', handler)
  }, [enabled, containerRef])
}

import { ref, Ref } from 'vue'

export interface UseTimePanelKeyboardOptions {
  /** Panel container ref */
  panelRef: Ref<HTMLElement | null>
  /** Close panel callback */
  onClose: () => void
}

export interface UseTimePanelKeyboardReturn {
  /** Focus option in specified unit */
  focusOptionInUnit: (
    unit: 'hour' | 'minute' | 'second' | 'period',
    action: 'prev' | 'next' | 'first' | 'last'
  ) => void
  /** Handle panel keydown events */
  handlePanelKeydown: (event: KeyboardEvent) => void
}

export function useTimePanelKeyboard(
  options: UseTimePanelKeyboardOptions
): UseTimePanelKeyboardReturn {
  const { panelRef, onClose } = options

  const focusOptionInUnit = (
    unit: 'hour' | 'minute' | 'second' | 'period',
    action: 'prev' | 'next' | 'first' | 'last'
  ) => {
    const panel = panelRef.value
    if (!panel) return

    const all = Array.from(
      panel.querySelectorAll(`button[data-tiger-timepicker-unit="${unit}"]`)
    ) as HTMLButtonElement[]

    const nodes = all.filter((button) => !button.disabled)
    if (nodes.length === 0) return

    const active = document.activeElement as HTMLButtonElement | null
    const activeIndex = active ? nodes.indexOf(active) : -1
    const selectedIndex = nodes.findIndex(
      (button) => button.getAttribute('aria-selected') === 'true'
    )
    const baseIndex = activeIndex >= 0 ? activeIndex : Math.max(0, selectedIndex)

    let nextIndex = baseIndex
    if (action === 'prev') nextIndex = Math.max(0, baseIndex - 1)
    if (action === 'next') nextIndex = Math.min(nodes.length - 1, baseIndex + 1)
    if (action === 'first') nextIndex = 0
    if (action === 'last') nextIndex = nodes.length - 1

    nodes[nextIndex]?.focus()
  }

  const handlePanelKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    const active = document.activeElement as HTMLElement | null
    const unit = active?.getAttribute('data-tiger-timepicker-unit') as
      | 'hour'
      | 'minute'
      | 'second'
      | 'period'
      | null

    if (!unit) return

    switch (event.key) {
      case 'ArrowUp': {
        event.preventDefault()
        focusOptionInUnit(unit, 'prev')
        return
      }
      case 'ArrowDown': {
        event.preventDefault()
        focusOptionInUnit(unit, 'next')
        return
      }
      case 'Home': {
        event.preventDefault()
        focusOptionInUnit(unit, 'first')
        return
      }
      case 'End': {
        event.preventDefault()
        focusOptionInUnit(unit, 'last')
        return
      }
      case 'Enter':
      case ' ': {
        const el = document.activeElement as HTMLButtonElement | null
        if (el && el.tagName === 'BUTTON' && !el.disabled) {
          event.preventDefault()
          el.click()
        }
        return
      }
    }
  }

  return {
    focusOptionInUnit,
    handlePanelKeydown
  }
}

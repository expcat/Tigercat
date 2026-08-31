import { cloneVNode, h, isVNode, type VNode } from 'vue'
import { classNames, shouldMergeOverlayTriggerChild } from '@expcat/tigercat-core'

export function resolveOverlayTriggerElement(el: unknown): HTMLElement | null {
  if (el == null) return null
  if (el instanceof HTMLElement) return el
  if (typeof el === 'object' && el !== null && '$el' in el) {
    const root = (el as { $el: unknown }).$el
    if (root instanceof HTMLElement) return root
  }
  return null
}

export function assignOverlayTriggerRef(target: { value: HTMLElement | null }, el: unknown): void {
  target.value = resolveOverlayTriggerElement(el)
}

export interface OverlayTriggerRenderOptions {
  asChild?: boolean
  child: VNode | VNode[] | string | number | null | undefined
  setTriggerRef: (el: unknown) => void
  className?: string
  disabled?: boolean
  extraChildren?: VNode | VNode[] | null
  aria: Record<string, unknown>
  handlers: Record<string, ((event: Event) => void) | undefined>
  preventDefaultOnClick?: boolean
}

function isSingleVNode(child: OverlayTriggerRenderOptions['child']): child is VNode {
  return isVNode(child)
}

export function renderOverlayTrigger(options: OverlayTriggerRenderOptions): VNode {
  const {
    asChild,
    child,
    setTriggerRef,
    className,
    disabled,
    extraChildren,
    aria,
    handlers,
    preventDefaultOnClick
  } = options

  const single = Array.isArray(child) && child.length === 1 ? child[0] : child
  const mergeable = isSingleVNode(single) && shouldMergeOverlayTriggerChild(asChild, single.type)

  const onClick = (event: Event) => {
    if (disabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (preventDefaultOnClick) event.preventDefault()
    handlers.onClick?.(event)
  }

  const mergedHandlers: Record<string, unknown> = {
    onClick,
    onKeydown: handlers.onKeydown ?? handlers.onKeyDown,
    onMouseenter: handlers.onMouseenter ?? handlers.onMouseEnter,
    onMouseleave: handlers.onMouseleave ?? handlers.onMouseLeave,
    onFocusin: handlers.onFocusin ?? handlers.onFocus,
    onFocusout: handlers.onFocusout ?? handlers.onBlur,
    onContextmenu: handlers.onContextmenu ?? handlers.onContextMenu
  }

  for (const key of Object.keys(mergedHandlers)) {
    if (mergedHandlers[key] == null) delete mergedHandlers[key]
  }

  if (mergeable && isSingleVNode(single)) {
    return cloneVNode(single, {
      ref: setTriggerRef,
      class: classNames(
        (single.props as { class?: unknown } | null)?.class as string | undefined,
        className
      ),
      disabled: disabled || undefined,
      ...aria,
      ...mergedHandlers
    })
  }

  const children: unknown[] = []
  if (Array.isArray(child)) children.push(...child)
  else if (child != null) children.push(child)
  if (extraChildren) {
    if (Array.isArray(extraChildren)) children.push(...extraChildren)
    else children.push(extraChildren)
  }

  return h(
    'button',
    {
      ref: setTriggerRef,
      type: 'button',
      class: className,
      disabled: disabled || undefined,
      ...aria,
      ...mergedHandlers
    },
    children
  )
}

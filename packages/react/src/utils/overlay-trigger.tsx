import { cloneElement, isValidElement, type ReactElement, type ReactNode, type Ref } from 'react'
import {
  classNames,
  shouldMergeOverlayTriggerChild,
  type OverlayTriggerAria
} from '@expcat/tigercat-core'

type AnyProps = Record<string, unknown>

export function composeRefs<T>(...refs: Array<Ref<T> | undefined>): (node: T | null) => void {
  return (node) => {
    for (const ref of refs) {
      if (ref == null) continue
      if (typeof ref === 'function') {
        ref(node)
      } else {
        ;(ref as { current: T | null }).current = node
      }
    }
  }
}

export function composeEventHandlers<E extends { defaultPrevented: boolean }>(
  theirs: ((event: E) => void) | undefined,
  ours: ((event: E) => void) | undefined
): ((event: E) => void) | undefined {
  if (!theirs) return ours
  if (!ours) return theirs
  return (event) => {
    theirs(event)
    if (event.defaultPrevented) return
    ours(event)
  }
}

function getElementRef(element: ReactElement): Ref<unknown> | undefined {
  const props = element.props as { ref?: Ref<unknown> }
  return props.ref ?? (element as { ref?: Ref<unknown> }).ref
}

export interface OverlayTriggerRenderOptions {
  asChild?: boolean
  child: ReactNode
  triggerRef: Ref<HTMLElement | null>
  className?: string
  disabled?: boolean
  extraChildren?: ReactNode
  aria: OverlayTriggerAria
  handlers: {
    onClick?: (event: React.MouseEvent<HTMLElement>) => void
    onKeyDown?: (event: React.KeyboardEvent<HTMLElement>) => void
    onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void
    onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void
    onFocus?: (event: React.FocusEvent<HTMLElement>) => void
    onBlur?: (event: React.FocusEvent<HTMLElement>) => void
    onContextMenu?: (event: React.MouseEvent<HTMLElement>) => void
  }
  preventDefaultOnClick?: boolean
}

export function renderOverlayTrigger(options: OverlayTriggerRenderOptions): ReactElement {
  const {
    asChild,
    child,
    triggerRef,
    className,
    disabled,
    extraChildren,
    aria,
    handlers,
    preventDefaultOnClick
  } = options

  const mergeable = isValidElement(child) && shouldMergeOverlayTriggerChild(asChild, child.type)

  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    if (disabled) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (preventDefaultOnClick) event.preventDefault()
    handlers.onClick?.(event)
  }

  if (mergeable && isValidElement(child)) {
    const childProps = child.props as AnyProps
    const childDisabled = Boolean(childProps.disabled) || disabled
    return cloneElement(child as ReactElement<AnyProps>, {
      ref: composeRefs(getElementRef(child) as Ref<HTMLElement>, triggerRef),
      className: classNames(childProps.className as string | undefined, className),
      disabled: childDisabled || undefined,
      ...aria,
      onClick: composeEventHandlers(
        childProps.onClick as ((event: React.MouseEvent) => void) | undefined,
        onClick
      ),
      onKeyDown: composeEventHandlers(
        childProps.onKeyDown as ((event: React.KeyboardEvent) => void) | undefined,
        handlers.onKeyDown
      ),
      onMouseEnter: composeEventHandlers(
        childProps.onMouseEnter as ((event: React.MouseEvent) => void) | undefined,
        handlers.onMouseEnter
      ),
      onMouseLeave: composeEventHandlers(
        childProps.onMouseLeave as ((event: React.MouseEvent) => void) | undefined,
        handlers.onMouseLeave
      ),
      onFocus: composeEventHandlers(
        childProps.onFocus as ((event: React.FocusEvent) => void) | undefined,
        handlers.onFocus
      ),
      onBlur: composeEventHandlers(
        childProps.onBlur as ((event: React.FocusEvent) => void) | undefined,
        handlers.onBlur
      ),
      onContextMenu: composeEventHandlers(
        childProps.onContextMenu as ((event: React.MouseEvent) => void) | undefined,
        handlers.onContextMenu
      )
    })
  }

  return (
    <button
      ref={triggerRef as Ref<HTMLButtonElement>}
      type="button"
      className={className}
      disabled={disabled}
      {...aria}
      onClick={onClick}
      onKeyDown={handlers.onKeyDown}
      onMouseEnter={handlers.onMouseEnter}
      onMouseLeave={handlers.onMouseLeave}
      onFocus={handlers.onFocus}
      onBlur={handlers.onBlur}
      onContextMenu={handlers.onContextMenu}>
      {child}
      {extraChildren}
    </button>
  )
}

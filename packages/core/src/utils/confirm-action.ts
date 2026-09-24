/**
 * Shared OK / confirm settlement for Modal and Popconfirm.
 * A prevented event or a rejected promise keeps the layer open.
 */

export interface DismissActionEvent {
  preventDefault(): void
  readonly defaultPrevented: boolean
}

export function createDismissActionEvent(): DismissActionEvent {
  let prevented = false
  return {
    preventDefault() {
      prevented = true
    },
    get defaultPrevented() {
      return prevented
    }
  }
}

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Promise<unknown>).then === 'function'
  )
}

/** `preventDefault`, `false`, or a rejected promise stays. Resolve closes. */
export async function settleDismissAction(
  result: unknown,
  event: DismissActionEvent
): Promise<'close' | 'stay'> {
  if (event.defaultPrevented || result === false) return 'stay'
  if (!isPromiseLike(result)) return 'close'
  try {
    const value = await result
    if (value === false || event.defaultPrevented) return 'stay'
  } catch {
    return 'stay'
  }
  return 'close'
}

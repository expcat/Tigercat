import {
  callWithErrorHandling,
  camelize,
  ErrorCodes,
  toHandlerKey,
  type ComponentInternalInstance
} from 'vue'

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return !!value && typeof (value as { then?: unknown }).then === 'function'
}

interface ResolvedEmitHandlers {
  handler: unknown
  onceHandler: unknown
  handlerName: string
}

/**
 * Resolve the listeners of the current vnode for an event, mirroring emit's
 * lookup: raw event key first, then camelized; the once variant follows the
 * resolved key. Dynamic listener updates are picked up because the current
 * vnode props are read on every call.
 */
function resolveEmitHandlers(
  instance: ComponentInternalInstance,
  event: string
): ResolvedEmitHandlers {
  const vnodeProps = (instance.vnode.props ?? {}) as Record<string, unknown>
  let handlerName = toHandlerKey(event)
  let handler = vnodeProps[handlerName]
  if (!handler) {
    handlerName = toHandlerKey(camelize(event))
    handler = vnodeProps[handlerName]
  }
  return { handler, onceHandler: vnodeProps[handlerName + 'Once'], handlerName }
}

/**
 * Whether the current vnode has any listener for an event (plain, array, or
 * once). Async consumers use this to gate their submit affordances so the
 * check never disagrees with what emitWithReturn would actually invoke.
 */
export function hasEmitHandler(instance: ComponentInternalInstance | null, event: string): boolean {
  if (!instance) return false
  const { handler, onceHandler, handlerName } = resolveEmitHandlers(instance, event)
  if (handler) return true
  // A consumed once listener will not be invoked again; without a plain
  // handler alongside it the event has no usable listener left.
  if (!onceHandler) return false
  return !instance.emitted?.[handlerName]
}

/**
 * Invoke the current vnode's listeners for an event and settle with their
 * return values. Vue's emit discards listener results, but load flights and
 * send/reply drafts need to know whether a listener returned a Promise.
 *
 * Handler lookup mirrors emit (raw event key first, then camelized) and keeps
 * array handlers, once bookkeeping and Vue's sync error semantics. Listener
 * Promises are consumed exactly once here: the returned Promise settles after
 * every listener Promise settles and rejects with the first rejection.
 * Returns undefined when no listener returned a thenable.
 */
export function emitWithReturn(
  instance: ComponentInternalInstance | null,
  event: string,
  args: unknown[] = []
): Promise<unknown[]> | undefined {
  if (!instance) return undefined
  const { handler, onceHandler, handlerName } = resolveEmitHandlers(instance, event)

  const results: unknown[] = []
  const invoke = (fn: unknown): void => {
    if (typeof fn === 'function') {
      results.push(callWithErrorHandling(fn, instance, ErrorCodes.COMPONENT_EVENT_HANDLER, args))
    } else if (Array.isArray(fn)) {
      for (const item of fn) {
        if (typeof item === 'function') {
          results.push(
            callWithErrorHandling(item, instance, ErrorCodes.COMPONENT_EVENT_HANDLER, args)
          )
        }
      }
    }
  }

  invoke(handler)

  if (onceHandler) {
    if (!instance.emitted) instance.emitted = {}
    if (!instance.emitted[handlerName]) {
      instance.emitted[handlerName] = true
      invoke(onceHandler)
    }
  }

  const pending = results.filter(isThenable)
  if (pending.length === 0) return undefined
  return Promise.allSettled(pending).then((settled) => {
    const rejected = settled.find((entry) => entry.status === 'rejected') as
      PromiseRejectedResult | undefined
    if (rejected) throw rejected.reason
    return settled.map((entry) => (entry as PromiseFulfilledResult<unknown>).value)
  })
}

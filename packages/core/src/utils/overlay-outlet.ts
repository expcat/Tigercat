/**
 * Framework-agnostic list of overlay nodes.
 *
 * The provider renders this list after its children, so server and client
 * paint an open layer in the same mount point. Callers only upsert and remove.
 */

export interface RenderOutletItem<T> {
  id: string
  node: T
}

export interface RenderOutlet<T> {
  upsert(id: string, node: T): void
  remove(id: string): void
  subscribe(listener: () => void): () => void
  getSnapshot(): readonly RenderOutletItem<T>[]
  getServerSnapshot(): readonly RenderOutletItem<T>[]
}

export function createRenderOutlet<T>(): RenderOutlet<T> {
  let items: readonly RenderOutletItem<T>[] = []
  const listeners = new Set<() => void>()
  let scheduled = false

  function emit(): void {
    if (scheduled) return
    scheduled = true
    queueMicrotask(() => {
      scheduled = false
      listeners.forEach((listener) => listener())
    })
  }

  return {
    upsert(id, node) {
      const index = items.findIndex((item) => item.id === id)
      if (index >= 0 && items[index].node === node) return
      const next = items.slice()
      if (index >= 0) next[index] = { id, node }
      else next.push({ id, node })
      items = next
      emit()
    },
    remove(id) {
      if (!items.some((item) => item.id === id)) return
      items = items.filter((item) => item.id !== id)
      emit()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    getSnapshot: () => items,
    getServerSnapshot: () => items
  }
}

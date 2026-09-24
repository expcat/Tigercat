/**
 * Escape and outside pointer dismiss.
 * Nested layers share a module stack that is separate from the focus scope.
 * Only the top layer receives Escape.
 */

export interface DismissLayerOptions {
  onDismiss: () => void
  escape?: boolean
  outsidePointer?: boolean
}

export interface DismissLayer {
  bind(): void
  unbind(): void
}

interface DismissEntry {
  element: HTMLElement
  onDismiss: () => void
  escape: boolean
}

const stacks = new WeakMap<Document, DismissEntry[]>()

function stackFor(doc: Document): DismissEntry[] {
  let stack = stacks.get(doc)
  if (!stack) {
    stack = []
    stacks.set(doc, stack)
  }
  return stack
}

function isTop(doc: Document, entry: DismissEntry): boolean {
  const stack = stackFor(doc)
  return stack[stack.length - 1] === entry
}

export function createDismissLayer(
  element: HTMLElement,
  options: DismissLayerOptions
): DismissLayer {
  const doc = element.ownerDocument
  const entry: DismissEntry = {
    element,
    onDismiss: options.onDismiss,
    escape: options.escape !== false
  }
  let bound = false

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !entry.escape) return
    if (!isTop(doc, entry)) return
    event.preventDefault()
    entry.onDismiss()
  }

  const onPointerDown = (event: PointerEvent) => {
    if (options.outsidePointer === false) return
    const target = event.target
    if (!(target instanceof Node)) return
    if (element.contains(target)) return
    entry.onDismiss()
  }

  return {
    bind() {
      if (bound) return
      bound = true
      stackFor(doc).push(entry)
      doc.addEventListener('keydown', onKeyDown)
      if (options.outsidePointer !== false) {
        doc.addEventListener('pointerdown', onPointerDown)
      }
    },
    unbind() {
      if (!bound) return
      bound = false
      const stack = stackFor(doc)
      const index = stack.indexOf(entry)
      if (index !== -1) stack.splice(index, 1)
      doc.removeEventListener('keydown', onKeyDown)
      doc.removeEventListener('pointerdown', onPointerDown)
    }
  }
}
